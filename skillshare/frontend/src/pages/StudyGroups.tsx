import React, { useState, useEffect } from 'react';
import { studyGroupService } from '../services/studyGroups';
import { StudyGroup } from '../types';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';

export const StudyGroups: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for creating a new group
  const [newGroup, setNewGroup] = useState({
    group_name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const groups = await studyGroupService.getAllGroups();
      setStudyGroups(groups);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const createdGroup = await studyGroupService.createGroup(newGroup);
      setStudyGroups([createdGroup, ...studyGroups]);
      setShowCreateModal(false);
      setNewGroup({ group_name: '', description: '', category: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await studyGroupService.joinGroup(groupId);
      // Refresh the groups list to show updated state
      await fetchStudyGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join study group');
    }
  };

  const filteredGroups = studyGroups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create New Group
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search study groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group._id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {group.group_name}
              </h3>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {group.category}
                </span>
                <Button
                  onClick={() => handleJoinGroup(group._id)}
                  variant="outline"
                >
                  Join Group
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Study Group"
      >
        <form onSubmit={handleCreateGroup} className="space-y-6">
          <div>
            <label htmlFor="group_name" className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <Input
              id="group_name"
              value={newGroup.group_name}
              onChange={(e) => setNewGroup({ ...newGroup, group_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <Input
              id="category"
              value={newGroup.category}
              onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};