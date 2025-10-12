import { FormEvent, useEffect, useState } from 'react';
import { 
  DollarSign,
  Users,
  Upload,
  Calculator,
  X,
  Receipt,
} from 'lucide-react';
import { getFriends } from '../services/friends';
import { createExpense } from '../services/expenses';


export function ExpensePage({ setActiveTab }) {
  const [splitType, setSplitType] = useState('EQUAL');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [notes, setNotes] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    getFriends().then(friendList => {
      const accepted = friendList.filter(friend => friend.status === 'ACCEPTED');
      setFriends(accepted);
    })
  }, [])

  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleFriendToggle = (friendId: number) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleFile = (file) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('File must be an image (PNG, JPG, or GIF)');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('title', description);
    formData.append('category', category);
    formData.append('notes', notes);
    formData.append('split_type', splitType);
    selectedFriends.forEach(friendId => {
      formData.append('participant_ids', friendId);
    });
    if (selectedFile) {
      formData.append('receipt', selectedFile);
    }
    createExpense(formData).then(() => {
      setActiveTab('dashboard');
      console.log('Expense created successfully');
    }).catch(error => {
      console.error('Error creating expense:', error);
      alert('Failed to create expense. Please try again.');
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {/* Amount and Description */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Dinner at Restaurant"
                  required
                />
              </div>
            </div>

            {/* Category and Notes */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="FOOD">Food & Dining</option>
                  <option value="TRANSPORT">Transportation</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="HEALTH">Health & Medical</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Split Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`p-4 rounded-lg border ${
                    splitType === 'EQUAL'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-5 w-5" />
                    <span>Split Equally</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('CUSTOM')}
                  className={`p-4 rounded-lg border ${
                    splitType === 'custom'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Custom Split</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Friend Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split With
              </label>
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedFriends.includes(friend.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.image}
                        alt={friend.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="font-medium text-gray-900">{friend.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFriendToggle(friend.id)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedFriends.includes(friend.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedFriends.includes(friend.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt (Optional)
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                  dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {filePreview ? (
                    <div className="relative w-full max-w-[200px] mx-auto">
                      <img
                        src={filePreview}
                        alt="Receipt preview"
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={selectedFriends.length === 0}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Expense
          </button>
        </div>
      </form>
    </div>
  );
}