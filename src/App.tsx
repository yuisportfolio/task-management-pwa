import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';

// --- 1. 型の定義（設計図） ---
export interface Task {
  id: number;
  title: string;
  member: string;
  time: string;
  priority: 'high' | 'low';
}

interface InputState {
  title: string;
  member: string;
  time: string;
  priority: 'high' | 'low';
}

const App: React.FC = () => {
  // --- 定数 ---
  const members: string[] = ["田中", "佐藤", "鈴木", "高橋"];
  const hours: string[] = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  // --- 2. Stateの定義（型を指定） ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('my-schedule');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState<InputState>({ 
    title: "", 
    member: "田中", 
    time: "09:00",
    priority: "low"
  });

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // --- 3. 副作用の管理 ---
  useEffect(() => {
    localStorage.setItem('my-schedule', JSON.stringify(tasks));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tasks]);

  // --- 4. ロジック（型安全な関数） ---
  const addTask = (): void => {
    if (!input.title) return;
    const newTask: Task = { ...input, id: Date.now() };
    setTasks([...tasks, newTask]);
    setInput({ ...input, title: "" });
  };

  const deleteTask = (id: number, title: string): void => {
    if (window.confirm(`「${title}」を削除しますか？`)) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };
  //ドラッグ&ドロップの処理
  const onDragEnd = (result: DropResult): void => {
    const { destination, draggableId } = result;
    if (!destination) return;
    
    const dId = destination.droppableId;
    let newMember: string;
    let newTime: string;

    if (dId.startsWith('mobile-')) {
      newTime = dId.replace('mobile-', '');
      newMember = tasks.find(t => String(t.id) === draggableId)?.member || "未定";
    } else {
      [newMember, newTime] = dId.split('-');
    }

    setTasks(prev => prev.map(t => 
      String(t.id) === draggableId ? { ...t, member: newMember, time: newTime } : t
    ));
  };

  // 子コンポーネントに渡す共通の道具（Props）
  const commonProps = { 
    members, 
    hours, 
    tasks, 
    deleteTask, 
    setInput, 
    input 
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full min-h-screen bg-slate-50 p-4 text-slate-800 font-sans">
        <header className="flex justify-between items-center mb-6 w-full mx-auto">
          <h1 className="text-2xl font-bold text-primary">本日の予定</h1>
          <div className="badge badge-outline border-slate-400 text-slate-600 font-medium">
            {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* 入力フォーム */}
        <div className="max-w-6xl bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end justify-center mx-auto text-slate-700">
          <div className="form-control">
            <label className="label text-xs font-bold">予定・案件名</label>
            <input 
              type="text" 
              className="input input-bordered input-sm bg-white" 
              value={input.title} 
              onChange={e => setInput({...input, title: e.target.value})} 
              placeholder="例：◯◯社打ち合わせ" 
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-slate-600">担当者</span></label>
            <select className="select select-bordered select-sm bg-white border-slate-300" value={input.member}
              onChange={e => setInput({ ...input, member: e.target.value })}>
              {members.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-slate-600">開始時間</span></label>
            <select className="select select-bordered select-sm bg-white border-slate-300" value={input.time}
              onChange={e => setInput({ ...input, time: e.target.value })}>
              {hours.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm px-6" onClick={addTask}>予約・追加</button>
        </div>

        {/* 切り替え表示 */}
        <span className="font-bold text-slate-600 px-2 text-xs">ダブルクリック（タップ）でタスク削除</span>
        <main>
          {isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />}
        </main>
      </div>
    </DragDropContext>
  );
};

export default App;