#!/usr/bin/env python3
import requests
import json
import uuid
import time
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://3db9d363-5751-4472-858e-9c1297b736ca.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }

    def log_test(self, test_name, passed, response=None, error=None):
        """Log test results"""
        result = {
            "test_name": test_name,
            "passed": passed,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if response:
            try:
                result["response"] = response.json() if hasattr(response, 'json') else response
                result["status_code"] = response.status_code if hasattr(response, 'status_code') else None
            except:
                result["response"] = str(response)
        
        if error:
            result["error"] = str(error)
        
        self.test_results["total_tests"] += 1
        if passed:
            self.test_results["passed_tests"] += 1
            print(f"✅ PASS: {test_name}")
        else:
            self.test_results["failed_tests"] += 1
            print(f"❌ FAIL: {test_name}")
            if error:
                print(f"    Error: {error}")
            if response and hasattr(response, 'status_code'):
                print(f"    Status Code: {response.status_code}")
                try:
                    print(f"    Response: {response.json()}")
                except:
                    print(f"    Response: {response.text}")
        
        self.test_results["test_details"].append(result)
        return passed

    def test_root_endpoint(self):
        """Test the root endpoint"""
        try:
            response = self.session.get(f"{API_URL}/")
            return self.log_test(
                "Root Endpoint", 
                response.status_code == 200 and "message" in response.json(),
                response
            )
        except Exception as e:
            return self.log_test("Root Endpoint", False, error=str(e))

    def test_status_post(self):
        """Test the status POST endpoint"""
        try:
            client_name = f"test_client_{uuid.uuid4()}"
            payload = {"client_name": client_name}
            response = self.session.post(f"{API_URL}/status", json=payload)
            
            # Check if response is successful and contains expected data
            success = (
                response.status_code == 200 and
                response.json().get("client_name") == client_name and
                "id" in response.json() and
                "timestamp" in response.json()
            )
            
            return self.log_test("Status POST Endpoint", success, response)
        except Exception as e:
            return self.log_test("Status POST Endpoint", False, error=str(e))

    def test_status_get(self):
        """Test the status GET endpoint"""
        try:
            # First create a status check to ensure there's data
            client_name = f"test_client_{uuid.uuid4()}"
            self.session.post(f"{API_URL}/status", json={"client_name": client_name})
            
            # Now get all status checks
            response = self.session.get(f"{API_URL}/status")
            
            # Check if response is successful and contains data
            success = (
                response.status_code == 200 and
                isinstance(response.json(), list) and
                len(response.json()) > 0 and
                all("client_name" in item for item in response.json())
            )
            
            return self.log_test("Status GET Endpoint", success, response)
        except Exception as e:
            return self.log_test("Status GET Endpoint", False, error=str(e))

    def test_mongodb_integration(self):
        """Test MongoDB integration by checking if data persists between requests"""
        try:
            # Create a unique client name
            client_name = f"mongodb_test_{uuid.uuid4()}"
            
            # Post a new status check
            post_response = self.session.post(
                f"{API_URL}/status", 
                json={"client_name": client_name}
            )
            
            if post_response.status_code != 200:
                return self.log_test(
                    "MongoDB Integration", 
                    False, 
                    post_response, 
                    "Failed to create test data"
                )
            
            # Get all status checks
            get_response = self.session.get(f"{API_URL}/status")
            
            if get_response.status_code != 200:
                return self.log_test(
                    "MongoDB Integration", 
                    False, 
                    get_response, 
                    "Failed to retrieve status checks"
                )
            
            # Check if our test client name is in the response
            status_checks = get_response.json()
            found = any(check.get("client_name") == client_name for check in status_checks)
            
            return self.log_test(
                "MongoDB Integration", 
                found, 
                get_response if not found else None,
                "Test data not found in database" if not found else None
            )
        except Exception as e:
            return self.log_test("MongoDB Integration", False, error=str(e))

    def test_cors_configuration(self):
        """Test CORS configuration by checking headers"""
        try:
            # Send an OPTIONS request to check CORS headers
            response = self.session.options(f"{API_URL}/")
            
            # Check for CORS headers
            headers = response.headers
            cors_headers_present = (
                "Access-Control-Allow-Origin" in headers and
                "Access-Control-Allow-Methods" in headers and
                "Access-Control-Allow-Headers" in headers
            )
            
            return self.log_test("CORS Configuration", cors_headers_present, response)
        except Exception as e:
            return self.log_test("CORS Configuration", False, error=str(e))

    def test_error_handling(self):
        """Test error handling by sending invalid requests"""
        try:
            # Test with invalid JSON
            response = self.session.post(
                f"{API_URL}/status", 
                data="invalid json",
                headers={"Content-Type": "application/json"}
            )
            
            # Check if we get a proper error response (4xx status code)
            is_error_status = 400 <= response.status_code < 500
            
            return self.log_test(
                "Error Handling", 
                is_error_status, 
                response,
                "Expected 4xx error but got " + str(response.status_code) if not is_error_status else None
            )
        except Exception as e:
            return self.log_test("Error Handling", False, error=str(e))

    def run_all_tests(self):
        """Run all tests and return results"""
        print(f"\n🔍 Testing backend at {API_URL}\n")
        
        # Run all test methods
        self.test_root_endpoint()
        self.test_status_post()
        self.test_status_get()
        self.test_mongodb_integration()
        self.test_cors_configuration()
        self.test_error_handling()
        
        # Print summary
        print("\n📊 Test Summary:")
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"Passed: {self.test_results['passed_tests']}")
        print(f"Failed: {self.test_results['failed_tests']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Exit with non-zero code if any tests failed
    sys.exit(1 if results["failed_tests"] > 0 else 0)
