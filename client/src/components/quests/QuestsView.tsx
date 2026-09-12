import React, { useState } from 'react';
import { 
  Sword, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Brain, 
  BookOpen, 
  Dumbbell, 
  Activity, 
  Compass, 
  Users,
  X,
  Zap,
  Coins
} from 'lucide-react';
import { useGame, Quest } from '../../context/GameContext';

export const QuestsView: React.FC = () => {
  const { quests, createQuest, updateQuest, deleteQuest, completeQuest, isLoadingQuests } = useGame();

  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Coding', 'Studying', 'Gym', 'Running', 'Meditation', 'Communication'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Epic', 'Legendary'];

  const attributeIcons: Record<string, any> = {
    Intelligence: Brain,
    Knowledge: BookOpen,
    Strength: Dumbbell,
    Stamina: Activity,
    Discipline: Compass,
    Social: Users
  };

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setCategory('Coding');
    setDifficulty('Medium');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (q: Quest) => {
    setEditingQuest(q);
    setTitle(q.title);
    setDescription(q.description || '');
    setCategory(q.category);
    setDifficulty(q.difficulty);
  };

  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingQuest) {
        await updateQuest(editingQuest.id, title, description, category, difficulty);
        setEditingQuest(null);
      } else {
        await createQuest(title, description, category, difficulty);
        setIsCreateOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Quests
  const filteredQuests = quests.filter(q => {
    if (statusTab === 'ACTIVE' && q.status !== 'ACTIVE') return false;
    if (statusTab === 'COMPLETED' && q.status !== 'COMPLETED') return false;
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim() !== '') {
      const qry = searchQuery.toLowerCase();
      return q.title.toLowerCase().includes(qry) || (q.description && q.description.toLowerCase().includes(qry));
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white flex items-center space-x-3">
            <Sword className="w-8 h-8 text-cyber-cyan" />
            <span>QUEST LOG</span>
          </h1>
          <p className="text-gray-400 text-sm font-sans mt-1">
            Create, manage, and complete real-world activities to earn XP and Gold.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="cyber-button-primary text-sm py-2.5 px-5 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>NEW QUEST</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="cyber-card p-4 space-y-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#24293e] pb-4">
          <div className="flex items-center space-x-2 bg-[#161926] p-1 rounded-xl border border-[#24293e]">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
                  statusTab === tab
                    ? 'bg-cyber-cyan text-black shadow-glow-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab} ({tab === 'ALL' ? quests.length : quests.filter(q => q.status === tab).length})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-cyber-dim absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input pl-9 text-xs w-full py-2"
            />
          </div>
        </div>

        {/* Category & Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-orbitron">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyber-cyan" />
            <span className="text-cyber-dim uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="cyber-input text-xs py-1.5 px-3"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-cyber-dim uppercase">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="cyber-input text-xs py-1.5 px-3"
            >
              <option value="All">All Difficulties</option>
              {difficulties.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Quest Grid */}
      {filteredQuests.length === 0 ? (
        <div className="cyber-card p-12 text-center space-y-4">
          <Sword className="w-12 h-12 text-cyber-dim mx-auto" />
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">NO QUESTS FOUND</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1">
              No quests match your selected filter criteria. Create a quest to begin!
            </p>
          </div>
          <button onClick={handleOpenCreate} className="cyber-button-primary inline-flex text-xs">
            <Plus className="w-4 h-4 mr-2" />
            <span>CREATE QUEST</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => {
            const Icon = attributeIcons[quest.attribute_type] || Brain;
            const isCompleted = quest.status === 'COMPLETED';

            return (
              <div 
                key={quest.id} 
                className={`cyber-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isCompleted ? 'opacity-70 border-gray-800 bg-[#10121b]/40' : 'hover:border-cyber-cyan/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-lg bg-[#161926] border border-[#24293e] text-cyber-cyan">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-[#161926] text-cyber-pink border border-cyber-pink/30">
                          {quest.category}
                        </span>
                        <span className="ml-2 text-[10px] font-orbitron px-2 py-0.5 rounded bg-[#161926] text-cyber-cyan border border-cyber-cyan/30">
                          {quest.difficulty}
                        </span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(quest)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#161926] rounded-md transition-colors"
                          title="Edit Quest"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuest(quest.id)}
                          className="p-1.5 text-gray-400 hover:text-cyber-red hover:bg-cyber-red/10 rounded-md transition-colors"
                          title="Delete Quest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className={`font-orbitron font-bold text-lg ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                      {quest.title}
                    </h3>
                    {quest.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{quest.description}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#24293e] flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs font-orbitron">
                    <span className="text-cyber-cyan flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{quest.xp_reward} XP</span>
                    </span>
                    <span className="text-cyber-yellow flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+🪙 {quest.gold_reward}</span>
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="text-xs font-orbitron text-cyber-green flex items-center space-x-1 bg-cyber-green/10 border border-cyber-green/30 px-3 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="cyber-button-primary text-xs py-1.5 px-4 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMPLETE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Quest Modal */}
      {(isCreateOpen || editingQuest) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="cyber-card p-6 max-w-lg w-full border-cyber-cyan space-y-5">
            <div className="flex items-center justify-between border-b border-[#24293e] pb-3">
              <h2 className="font-orbitron font-bold text-xl text-white">
                {editingQuest ? 'EDIT QUEST' : 'CREATE NEW QUEST'}
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingQuest(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                  Quest Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete 2 hours of Deep Work"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="cyber-input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details or sub-tasks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="cyber-input w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="cyber-input w-full text-xs"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="cyber-input w-full text-xs"
                  >
                    {difficulties.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Reward Preview Box */}
              <div className="bg-[#161926] p-3 rounded-xl border border-[#24293e] flex items-center justify-around text-xs font-orbitron">
                <span className="text-cyber-cyan">REWARD: +XP Depends on Difficulty</span>
                <span className="text-cyber-yellow">+🪙 Gold Awarded</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingQuest(null);
                  }}
                  className="cyber-button-secondary text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cyber-button-primary text-xs"
                >
                  {isSubmitting ? 'SAVING...' : editingQuest ? 'UPDATE QUEST' : 'INITIATE QUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
