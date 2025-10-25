import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  UserCheck, 
  Star, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { studyGroups, resources, mentorSessions, notifications } = useApp();

  // Sample data for dashboard metrics
  const stats = [
    {
      label: 'Study Groups',
      value: user?.studyGroups.length || 0,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      link: '/study-groups',
    },
    {
      label: 'Resources Shared',
      value: resources.filter(r => r.uploadedBy.id === user?.id).length,
      icon: FileText,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
      link: '/resources',
    },
    {
      label: 'Mentor Sessions',
      value: user?.mentorshipSessions || 0,
      icon: UserCheck,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
      link: '/mentorship',
    },
    {
      label: 'Learning Streak',
      value: 15,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/dashboard',
    },
  ];

  const upcomingSessions = mentorSessions.filter(
    session => session.status === 'scheduled' && 
    (session.mentor.id === user?.id || session.mentee.id === user?.id)
  );

  const recentNotifications = notifications
    .filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const suggestedGroups = studyGroups
    .filter(group => !user?.studyGroups.includes(group.id))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl text-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {user?.isMentor && (
              <Badge variant="success" className="bg-white/20 text-white border-white/30">
                <Award className="w-4 h-4 mr-1" />
                Mentor
              </Badge>
            )}
            {user?.rating && (
              <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-300 fill-current" />
                <span className="font-semibold">{user.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link}>
              <Card hover className="text-center animate-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Upcoming Sessions
              </h2>
              <Link to="/mentorship">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.subject}</h3>
                        <p className="text-sm text-gray-600">
                          {session.mentor.id === user?.id ? 'Mentoring' : 'Learning from'}{' '}
                          <span className="font-medium">
                            {session.mentor.id === user?.id ? session.mentee.name : session.mentor.name}
                          </span>
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <Badge variant="warning">{session.duration}min</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming sessions</p>
                <Link to="/mentorship" className="text-primary-600 hover:text-primary-700 text-sm">
                  Schedule a session
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Recent Activity
            </h2>
            
            {recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.isRead ? 'bg-gray-300' : 'bg-primary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Suggested Study Groups */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
            Suggested Study Groups
          </h2>
          <Link to="/study-groups">
            <Button variant="ghost" size="sm">
              Explore All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {suggestedGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              {group.image && (
                <img 
                  src={group.image} 
                  alt={group.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="gray" size="sm">{group.subject}</Badge>
                <Button size="sm" variant="outline">
                  Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;