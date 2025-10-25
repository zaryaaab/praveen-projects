import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Star,
  MessageCircle,
  Award,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';

const Mentorship: React.FC = () => {
  const { mentorSessions, scheduleMentorSession } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sessions' | 'mentors' | 'requests'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [sessionRequest, setSessionRequest] = useState({
    subject: '',
    date: '',
    time: '',
    duration: 60,
    message: '',
  });

  // Mock mentors data
  const mentors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      expertise: ['Machine Learning', 'Data Science', 'Python'],
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 50,
      bio: 'PhD in Computer Science with 8+ years of experience in machine learning and data analytics.',
      availability: 'Available weekdays 9AM-5PM EST',
    },
    {
      id: '2',
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
      expertise: ['React', 'Node.js', 'Full Stack Development'],
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 40,
      bio: 'Senior Full Stack Developer with expertise in modern web technologies.',
      availability: 'Available evenings and weekends',
    },
    {
      id: '3',
      name: 'Emily Chen',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
      expertise: ['UI/UX Design', 'Figma', 'Design Systems'],
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: 45,
      bio: 'Senior Product Designer with 6+ years creating intuitive user experiences.',
      availability: 'Flexible schedule',
    },
  ];

  const userSessions = mentorSessions.filter(
    session => session.mentor.id === user?.id || session.mentee.id === user?.id
  );

  const upcomingSessions = userSessions.filter(session => session.status === 'scheduled');
  const completedSessions = userSessions.filter(session => session.status === 'completed');

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    const session = {
      id: Math.random().toString(),
      mentor: selectedMentor,
      mentee: user!,
      subject: sessionRequest.subject,
      scheduledAt: new Date(`${sessionRequest.date}T${sessionRequest.time}`),
      duration: sessionRequest.duration,
      status: 'scheduled' as const,
      notes: sessionRequest.message,
    };

    scheduleMentorSession(session);
    setIsScheduleModalOpen(false);
    setSelectedMentor(null);
    setSessionRequest({
      subject: '',
      date: '',
      time: '',
      duration: 60,
      message: '',
    });
  };

  const openScheduleModal = (mentor: any) => {
    setSelectedMentor(mentor);
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-1">Connect with experts and advance your skills</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.isMentor && (
            <Badge variant="success" className="flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Mentor
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sessions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Sessions
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'mentors'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requests
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Upcoming Sessions
            </h2>
            
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{session.subject}</h3>
                      <Badge variant="warning">{session.duration}min</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <img
                            src={session.mentor.id === user?.id ? session.mentee.avatar : session.mentor.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <span className="text-sm text-gray-600">
                            {session.mentor.id === user?.id ? 'Mentoring' : 'Learning from'}{' '}
                            <span className="font-medium">
                              {session.mentor.id === user?.id ? session.mentee.name : session.mentor.name}
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">Join Session</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming sessions</p>
              </div>
            )}
          </Card>

          {/* Completed Sessions */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Recent Sessions
            </h2>
            
            {completedSessions.length > 0 ? (
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{session.subject}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success">Completed</Badge>
                        {session.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium">{session.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <img
                            src={session.mentor.id === user?.id ? session.mentee.avatar : session.mentor.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <span className="text-sm text-gray-600">
                            {session.mentor.id === user?.id ? session.mentee.name : session.mentor.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(session.scheduledAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {!session.rating && session.mentee.id === user?.id && (
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4 mr-1" />
                          Rate Session
                        </Button>
                      )}
                    </div>
                    
                    {session.feedback && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 italic">"{session.feedback}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No completed sessions yet</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search mentors by expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                fullWidth
              />
            </div>
          </Card>

          {/* Mentors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} hover className="h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({mentor.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 flex-1">{mentor.bio}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                    <span>${mentor.hourlyRate}/hour</span>
                    <span>{mentor.availability}</span>
                  </div>
                  
                  <Button 
                    fullWidth 
                    onClick={() => openScheduleModal(mentor)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Requests</h2>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No pending requests</p>
          </div>
        </Card>
      )}

      {/* Schedule Session Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Session with ${selectedMentor?.name}`}
        size="lg"
      >
        {selectedMentor && (
          <form onSubmit={handleScheduleSession} className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedMentor.avatar}
                alt={selectedMentor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedMentor.name}</h3>
                <p className="text-sm text-gray-600">${selectedMentor.hourlyRate}/hour</p>
              </div>
            </div>
            
            <Input
              label="Session Topic"
              value={sessionRequest.subject}
              onChange={(e) => setSessionRequest({ ...sessionRequest, subject: e.target.value })}
              placeholder="What would you like to learn?"
              fullWidth
              required
            />
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={sessionRequest.date}
                onChange={(e) => setSessionRequest({ ...sessionRequest, date: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Time"
                type="time"
                value={sessionRequest.time}
                onChange={(e) => setSessionRequest({ ...sessionRequest, time: e.target.value })}
                fullWidth
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={sessionRequest.duration}
                onChange={(e) => setSessionRequest({ ...sessionRequest, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={sessionRequest.message}
                onChange={(e) => setSessionRequest({ ...sessionRequest, message: e.target.value })}
                placeholder="Tell the mentor what you'd like to focus on..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              <span className="text-lg font-bold text-primary-600">
                ${(selectedMentor.hourlyRate * (sessionRequest.duration / 60)).toFixed(2)}
              </span>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                fullWidth
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth>
                Request Session
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Mentorship;