import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  Edit3,
  Trash2,
  User,
  Crown,
  Check,
  X,
  Search,
  Filter,
  UserPlus,
  Settings,
  Calendar,
  Activity,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeamManagement = ({ user, companyData }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock team data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'admin',
      status: 'active',
      lastActive: '2024-01-15T10:30:00Z',
      joinedDate: '2023-06-15',
      avatar: null,
      permissions: ['view', 'edit', 'delete', 'invite'],
      companies: ['TechCorp', 'FinanceInc']
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      email: 'michael.r@company.com',
      role: 'senior_analyst',
      status: 'active',
      lastActive: '2024-01-15T09:15:00Z',
      joinedDate: '2023-08-22',
      avatar: null,
      permissions: ['view', 'edit'],
      companies: ['TechCorp']
    },
    {
      id: 3,
      name: 'Emma Thompson',
      email: 'emma.thompson@company.com',
      role: 'analyst',
      status: 'active',
      lastActive: '2024-01-14T16:45:00Z',
      joinedDate: '2023-11-10',
      avatar: null,
      permissions: ['view'],
      companies: ['FinanceInc']
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'viewer',
      status: 'invited',
      lastActive: null,
      joinedDate: null,
      avatar: null,
      permissions: ['view'],
      companies: []
    }
  ]);

  const roles = [
    { 
      id: 'admin', 
      name: 'Admin', 
      description: 'Full access to all features and team management',
      permissions: ['view', 'edit', 'delete', 'invite', 'manage'],
      color: 'red'
    },
    { 
      id: 'senior_analyst', 
      name: 'Senior Analyst', 
      description: 'Can view and edit all analyses, create reports',
      permissions: ['view', 'edit', 'create_reports'],
      color: 'blue'
    },
    { 
      id: 'analyst', 
      name: 'Analyst', 
      description: 'Can view analyses and create basic reports',
      permissions: ['view', 'basic_edit'],
      color: 'green'
    },
    { 
      id: 'viewer', 
      name: 'Viewer', 
      description: 'Read-only access to dashboards and reports',
      permissions: ['view'],
      color: 'gray'
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.id === role);
    switch (roleObj?.color) {
      case 'red': return 'text-red-600 bg-red-100 border-red-200';
      case 'blue': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'green': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'senior_analyst': return Shield;
      case 'analyst': return User;
      default: return User;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'invited': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Check if user already exists
    if (teamMembers.some(member => member.email === inviteEmail)) {
      toast.error('User with this email already exists');
      return;
    }

    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      lastActive: null,
      joinedDate: null,
      avatar: null,
      permissions: roles.find(r => r.id === inviteRole)?.permissions || ['view'],
      companies: []
    };

    setTeamMembers(prev => [...prev, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    
    setInviteEmail('');
    setInviteRole('analyst');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success('Team member removed');
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Manage team members, roles, and permissions</p>
        </div>
        <motion.button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Total Members', 
            value: teamMembers.length, 
            icon: Users, 
            color: 'blue',
            change: '+2 this month'
          },
          { 
            label: 'Active Members', 
            value: teamMembers.filter(m => m.status === 'active').length, 
            icon: Activity, 
            color: 'green',
            change: '100% online'
          },
          { 
            label: 'Pending Invites', 
            value: teamMembers.filter(m => m.status === 'invited').length, 
            icon: Clock, 
            color: 'yellow',
            change: '1 this week'
          },
          { 
            label: 'Admins', 
            value: teamMembers.filter(m => m.role === 'admin').length, 
            icon: Crown, 
            color: 'purple',
            change: 'Full access'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{stat.label}</h3>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Companies
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const roleData = roles.find(r => r.id === member.role);
                
                return (
                  <motion.tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="w-4 h-4 text-gray-600" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {roleData?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastActive(member.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.companies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {member.companies.slice(0, 2).map((company, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {company}
                            </span>
                          ))}
                          {member.companies.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{member.companies.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No companies</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  {inviteRole && (
                    <p className="text-sm text-gray-600 mt-1">
                      {roles.find(r => r.id === inviteRole)?.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <motion.button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleInviteUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Invite
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;