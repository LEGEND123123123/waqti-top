import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface AdminDashboardProps {
  setActivePage: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActivePage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock admin data
  const [stats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalServices: 456,
    pendingVerifications: 23,
    activeEscrows: 67,
    totalTransactions: 3421,
    disputesOpen: 5,
    supportTickets: 12
  });

  const [pendingVerifications] = useState([
    {
      id: '1',
      userId: 'user1',
      name: 'أحمد حسن',
      email: 'ahmed@example.com',
      submittedAt: new Date(),
      step: 'Business Gallery',
      status: 'pending'
    },
    {
      id: '2',
      userId: 'user2',
      name: 'سارة علي',
      email: 'sara@example.com',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      step: 'Admission Test',
      status: 'under_review'
    }
  ]);

  const [escrowTransactions] = useState([
    {
      id: 'tx1',
      clientName: 'محمد أحمد',
      freelancerName: 'ليلى محمد',
      amount: 5,
      status: 'held',
      createdAt: new Date(),
      autoReleaseAt: new Date(Date.now() + 1000 * 60 * 60 * 48)
    },
    {
      id: 'tx2',
      clientName: 'فاطمة سالم',
      freelancerName: 'خالد عبدالله',
      amount: 3,
      status: 'disputed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      disputeReason: 'Quality issues with delivered work'
    }
  ]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Button variant="primary" onClick={() => setActivePage('home')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'verifications', name: 'Verifications', icon: CheckCircle },
    { id: 'escrow', name: 'Escrow Management', icon: Shield },
    { id: 'disputes', name: 'Disputes', icon: AlertTriangle },
    { id: 'reports', name: 'Reports', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="secondary" onClick={() => setActivePage('home')}>
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Escrows</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEscrows}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disputesOpen}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#2E86AB] text-[#2E86AB]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Verifications</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search verifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingVerifications.map(verification => (
                    <div key={verification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{verification.name}</h4>
                          <p className="text-sm text-gray-600">{verification.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Step: {verification.step}</span>
                            <span>Submitted: {verification.submittedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            verification.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {verification.status}
                          </span>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="primary" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Escrow Management Tab */}
            {activeTab === 'escrow' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Escrow Transactions</h3>
                  <Button variant="secondary">
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>

                <div className="space-y-4">
                  {escrowTransactions.map(transaction => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {transaction.clientName} → {transaction.freelancerName}
                            </h4>
                            <span className="text-lg font-bold text-[#F18F01]">
                              {transaction.amount} Hours
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Created: {transaction.createdAt.toLocaleDateString()}</span>
                            {transaction.autoReleaseAt && (
                              <span>Auto-release: {transaction.autoReleaseAt.toLocaleDateString()}</span>
                            )}
                            {transaction.disputeReason && (
                              <span className="text-red-600">Dispute: {transaction.disputeReason}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'held' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'disputed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {transaction.status === 'held' && (
                            <Button variant="primary" size="sm">
                              Release
                            </Button>
                          )}
                          {transaction.status === 'disputed' && (
                            <>
                              <Button variant="primary" size="sm">
                                Resolve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                                Refund
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="primary" 
                    onClick={() => setActiveTab('verifications')}
                    className="h-20 flex-col"
                  >
                    <CheckCircle className="h-6 w-6 mb-2" />
                    Review Verifications
                    <span className="text-sm opacity-75">{stats.pendingVerifications} pending</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('escrow')}
                    className="h-20 flex-col"
                  >
                    <Shield className="h-6 w-6 mb-2" />
                    Manage Escrow
                    <span className="text-sm opacity-75">{stats.activeEscrows} active</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('disputes')}
                    className="h-20 flex-col border-red-300 text-red-600"
                  >
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Handle Disputes
                    <span className="text-sm opacity-75">{stats.disputesOpen} open</span>
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>New user registration: أحمد محمد</span>
                      <span className="text-gray-500">2 minutes ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Verification submitted: سارة علي</span>
                      <span className="text-gray-500">15 minutes ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Escrow created: 5 hours</span>
                      <span className="text-gray-500">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;