import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Star, 
  Edit3, 
  Save, 
  X,
  Plus,
  Users,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      interests: user?.interests || [],
    });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData({
        ...editData,
        skills: [...editData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setEditData({
      ...editData,
      skills: editData.skills.filter(s => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !editData.interests.includes(newInterest.trim())) {
      setEditData({
        ...editData,
        interests: [...editData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditData({
      ...editData,
      interests: editData.interests.filter(i => i !== interest)
    });
  };

  const stats = [
    {
      label: 'Study Groups',
      value: user?.studyGroups.length || 0,
      icon: Users,
      color: 'text-primary-600',
    },
    {
      label: 'Resources Shared',
      value: 12,
      icon: FileText,
      color: 'text-secondary-600',
    },
    {
      label: 'Mentor Sessions',
      value: user?.mentorshipSessions || 0,
      icon: UserCheck,
      color: 'text-accent-600',
    },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center space-x-4 mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-bold"
                    fullWidth
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                )}
                
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  {user.isMentor && (
                    <Badge variant="success">
                      <Award className="w-3 h-3 mr-1" />
                      Mentor
                    </Badge>
                  )}
                  {user.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{user.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              ) : (
                <p className="text-gray-600">
                  {user.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            
            {isEditing && (
              <div className="flex space-x-2 mb-4">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData.skills : user.skills).map((skill) => (
                <Badge key={skill} variant="primary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {(isEditing ? editData.skills : user.skills).length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              )}
            </div>
          </Card>

          {/* Interests */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Interests</h3>
            
            {isEditing && (
              <div className="flex space-x-2 mb-4">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData.interests : user.interests).map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                  <span>{interest}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-secondary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {(isEditing ? editData.interests : user.interests).length === 0 && (
                <p className="text-gray-500 text-sm">No interests added yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
            <div className="space-y-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">First Study Group</p>
                  <p className="text-sm text-gray-600">Joined your first study group</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Helpful Member</p>
                  <p className="text-sm text-gray-600">Received 5+ helpful votes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Community Builder</p>
                  <p className="text-sm text-gray-600">Created a study group</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;