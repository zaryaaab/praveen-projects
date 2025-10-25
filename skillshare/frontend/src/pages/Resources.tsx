import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Download,
  Star,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';

const Resources: React.FC = () => {
  const { resources, addResource } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'video' | 'notes' | 'link',
    url: '',
    subject: '',
    tags: '',
  });

  const resourceTypes = [
    { value: 'all', label: 'All Types', icon: FileText },
    { value: 'pdf', label: 'PDFs', icon: FileText },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'link', label: 'Links', icon: LinkIcon },
  ];

  const subjects = ['All Subjects', 'Web Development', 'Data Science', 'Mobile Development', 'Machine Learning', 'Design'];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'link':
        return LinkIcon;
      default:
        return FileText;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || selectedSubject === 'All Subjects' || resource.subject === selectedSubject;
    
    return matchesSearch && matchesType && matchesSubject;
  });

  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    const resource = {
      ...newResource,
      id: Math.random().toString(),
      uploadedBy: user!,
      createdAt: new Date(),
      downloadCount: 0,
      rating: 0,
      tags: newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    
    addResource(resource as any);
    setIsUploadModalOpen(false);
    setNewResource({
      title: '',
      description: '',
      type: 'pdf',
      url: '',
      subject: '',
      tags: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
          <p className="text-gray-600 mt-1">Discover and share study materials</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              fullWidth
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex flex-wrap gap-2">
                {resourceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedType === type.value
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const Icon = getResourceIcon(resource.type);
          
          return (
            <Card key={resource.id} hover className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <Badge variant="secondary" size="sm">
                    {resource.type.toUpperCase()}
                  </Badge>
                </div>
                
                {resource.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{resource.rating}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                {resource.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gray" size="sm">{resource.subject}</Badge>
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="primary" size="sm">{tag}</Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="primary" size="sm">+{resource.tags.length - 3}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {resource.uploadedBy.name}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloadCount}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" fullWidth>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share a resource!'}
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Resource
          </Button>
        </Card>
      )}

      {/* Upload Resource Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New Resource"
        size="lg"
      >
        <form onSubmit={handleUploadResource} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Resource Title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="Enter resource title"
              fullWidth
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="pdf">PDF Document</option>
                <option value="video">Video</option>
                <option value="notes">Study Notes</option>
                <option value="link">External Link</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              placeholder="Describe your resource..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              required
            />
          </div>
          
          <Input
            label={newResource.type === 'link' ? 'URL' : 'File URL'}
            value={newResource.url}
            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
            placeholder={newResource.type === 'link' ? 'https://example.com' : 'Upload file or enter URL'}
            fullWidth
            required
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={newResource.subject}
                onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.slice(1).map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <Input
              label="Tags (comma-separated)"
              value={newResource.tags}
              onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
              placeholder="React, JavaScript, Tutorial"
              fullWidth
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              fullWidth
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth>
              Upload Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;