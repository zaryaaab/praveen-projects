import React, { useEffect, useState } from 'react';
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
import { StudyGroup } from '../types';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { studyGroupService } from '../services/studyGroups';
import { resourcesService } from '../services/resources';

interface ResourceUser { name?: string; email?: string }
interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  file_base64: string;
  uploaded_by?: ResourceUser;
  group_id: string;
  category: 'pdf' | 'video' | 'notes' | string;
  tags: string[];
  uploaded_at?: string | number | Date;
  rating?: number;
  type?: 'pdf' | 'video' | 'notes' | string;
}

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'video' | 'notes',
    file: null as File | null,
    subject: '',
    tags: '',
  });

  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupResources, setGroupResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const filteredResources = groupResources.filter((resource: ResourceItem) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(resource.tags) && resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesType = selectedType === 'all' || resource.category === selectedType || resource.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || selectedSubject === 'All Subjects';
    
    return matchesSearch && matchesType && matchesSubject;
  });

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true);
        const gs = await studyGroupService.getAllGroups();
        setGroups(gs);
        if (gs.length > 0 && !selectedGroupId) {
          setSelectedGroupId(gs[0]._id);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load study groups';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const loadResources = async () => {
      if (!selectedGroupId) {
        setGroupResources([]);
        return;
      }
      try {
        setIsLoading(true);
        const res = await resourcesService.getGroupResources(selectedGroupId);
        setGroupResources(res as ResourceItem[]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load resources';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, [selectedGroupId]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (!selectedGroupId) {
        setError('Please select a group first');
        return;
      }
      if (!newResource.file) {
        setError('Please choose a file to upload');
        return;
      }
      const file_base64 = await fileToBase64(newResource.file);
      const tagsArr = newResource.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: newResource.title,
        description: newResource.description,
        file_base64,
        group_id: selectedGroupId,
        category: newResource.type,
        tags: tagsArr
      };
      const saved = await resourcesService.uploadResource(payload);
      setGroupResources([saved, ...groupResources]);
      setIsUploadModalOpen(false);
      setNewResource({
        title: '',
        description: '',
        type: 'pdf',
        file: null,
        subject: '',
        tags: '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    }
  };

  const handlePreview = (resource: ResourceItem) => {
    const category = resource.type || resource.category || 'pdf';
    let mime = 'application/octet-stream';
    if (category === 'pdf') mime = 'application/pdf';
    if (category === 'video') mime = 'video/mp4';
    if (category === 'notes') mime = 'text/plain';
    const blob = b64toBlob(resource.file_base64, mime);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = (resource: ResourceItem) => {
    const category = resource.type || resource.category || 'pdf';
    let mime = 'application/octet-stream';
    if (category === 'pdf') mime = 'application/pdf';
    if (category === 'video') mime = 'video/mp4';
    if (category === 'notes') mime = 'text/plain';
    const blob = b64toBlob(resource.file_base64, mime);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title}.${category === 'notes' ? 'txt' : category === 'video' ? 'mp4' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
          <p className="text-gray-600 mt-1">Discover and share study materials</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {groups.length === 0 && <option value="">No groups available</option>}
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.group_name}</option>
            ))}
          </select>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Resource
          </Button>
        </div>
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

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Resources Grid */}
      {isLoading && (
        <div className="text-center py-6 text-gray-500">Loading resources...</div>
      )}

      {!isLoading && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource: ResourceItem) => {
          const Icon = getResourceIcon(resource.type || resource.category);
          
          return (
            <Card key={resource._id || resource.id} hover className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <Badge variant="secondary" size="sm">
                    {(resource.type || resource.category || 'resource').toUpperCase()}
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
                  <Badge variant="gray" size="sm">{resource.category}</Badge>
                  {resource.tags.slice(0, 3).map((tag: string) => (
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
                      {resource.uploaded_by?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloadCount}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(resource.uploaded_at || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => handlePreview(resource)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" fullWidth onClick={() => handleDownload(resource)}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
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
            <Button type="submit" fullWidth disabled={!selectedGroupId || !newResource.file}>
              Upload Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;