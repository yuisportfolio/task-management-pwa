
import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';

// App.tsx の一番上の方に書く
interface Task {
  id: number;
  title: string;
  member: string;
  time: string;
}
//
interface result {
  id: number;
  title: string;
  member: string;
  time: string;
  priority?: 'high' | 'low'; // ? は「あってもなくても良い」という意味
}

function App() {
  const members = ["田中", "佐藤", "鈴木", "高橋"];
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];


// useState の書き方が少し変わります
  const [tasks, setTasks] = useState<Task[]>([]); 
// <Task[]> は「これは Task という形のデータの配列だよ」という意味

/*   const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('my-schedule');
    return saved ? JSON.parse(saved) : [];
  }); */

  const [input, setInput] = useState({ title: "", member: "田中", time: "09:00" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    localStorage.setItem('my-schedule', JSON.stringify(tasks));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tasks]);

  const addTask = () => {
    if (!input.title) return;
    setTasks([...tasks, { ...input, id: Date.now() }]);
    setInput({ ...input, title: "" });
  };

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    
    const dId = destination.droppableId;
    let newMember, newTime;

    if (dId.startsWith('mobile-')) {
      newTime = dId.replace('mobile-', '');
      newMember = tasks.find(t => String(t.id) === draggableId)?.member || "未定";
    } else {
      [newMember, newTime] = dId.split('-');
    }

    setTasks(prev => prev.map(t => String(t.id) === draggableId ? { ...t, member: newMember, time: newTime } : t));
  };

  const commonProps = { members, hours, tasks, deleteTask: (id, title) => {
    if (window.confirm(`「${title}」を削除しますか？`)) setTasks(tasks.filter(t => t.id !== id));
  }, setInput, input };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-slate-50 p-4 text-slate-800">
        <header className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">本日の予定</h1>
          <div className="badge badge-outline border-slate-400 text-slate-600 font-medium">{new Date().toLocaleDateString()}</div>
        </header>

        {/* 入力フォーム（PCでもスマホでも共通で使う） */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end justify-center max-w-6xl mx-auto text-slate-700">
           {/* ... 入力フォームの内容 ... */}
           <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-slate-600">予定・案件名　</span></label>
            <input type="text" placeholder="例：〇〇社打ち合わせ" className="input input-bordered input-sm w-48 bg-white border-slate-300 focus:border-primary" 
              value={input.title} onChange={e => setInput({ ...input, title: e.target.value })} />
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
          <button className="btn btn-primary btn-sm px-6 shadow-md text-slate-600" onClick={addTask}>予約・追加</button>
        </div>

        {/* 切り替え表示 */}
        {isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />}
      </div>
    </DragDropContext>
  );
}

export default App;