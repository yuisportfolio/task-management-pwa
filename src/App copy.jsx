import React, { useState, useEffect } from 'react'
import TaskCard from './components/TaskCard'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
  const members = ["田中", "佐藤", "鈴木", "高橋"];
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('my-schedule');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem('my-schedule', JSON.stringify(tasks));
  }, [tasks]);

  const [input, setInput] = useState({ title: "", member: "田中", time: "09:00" });

  const addTask = () => {
    if (!input.title) return;
    const newTask = { ...input, id: Date.now(), priority: "low" };
    setTasks([...tasks, newTask]);
    setInput({ ...input, title: "" });
  };

  const deleteTask = (id, title) => {
    const result = window.confirm(`「${title}」を削除してもよろしいですか？`);
    if (result) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) return;

    const [newMember, newTime] = destination.droppableId.split('-');
    setTasks(prev => prev.map(task => 
      String(task.id) === draggableId 
        ? { ...task, member: newMember, time: newTime } 
        : task
    ));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* 全体の背景を少しグレーにして、カードを白に際立たせる */}
      <div className="min-h-screen bg-slate-50 p-4 text-slate-800 [color-scheme:light] ">
        <header className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">本日の予定</h1>
          <div className="badge badge-outline border-slate-400 text-slate-600 font-medium">
            {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* 入力エリア：背景白、文字色を濃いグレーに固定 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end justify-center max-w-6xl mx-auto text-slate-700">
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

        {/* タイムライン表：ヘッダーの色と文字色を調整 */}
        <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
          <table className="table table-fixed w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="w-24 bg-slate-100 text-slate-700 font-bold text-center sticky left-0 z-20 border-r border-slate-200">担当者</th>
                {hours.map(h => <th key={h} className="w-40 text-center text-slate-600 font-bold border-l border-slate-200">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                  <th className="font-bold text-center bg-white text-slate-700 border-r border-slate-200 sticky left-0 z-10">{member}</th>
                  {hours.map(time => {
                    const droppableId = `${member}-${time}`;
                    const cellTasks = tasks.filter(t => t.member === member && t.time === time);
                    
                    return (
                      <Droppable key={droppableId} droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <td 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-1 h-24 align-top border-l border-slate-100 group transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                          >
                            <div className="min-h-full space-y-1">
                              {cellTasks.length > 0 ? (
                                cellTasks.map((task, index) => (
                                  <TaskCard key={task.id} index={index} task={task} onDelete={() => deleteTask(task.id, task.title)} />
                                ))
                              ) : (
                                <button
                                  className="btn btn-ghost btn-xs w-full h-full min-h-[60px] text-slate-400 font-medium bg-white
                                  opacity-0 group-hover:opacity-100 hover:bg-blue-50 border-dashed border border-transparent hover:border-primary/30 hover:text-primary transition-all duration-200"
                                  onClick={() => setInput({ ...input, member, time })}
                                >
                                  + 予約
                                </button>
                              )}
                              {provided.placeholder}
                            </div>
                          </td>
                        )}
                      </Droppable>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DragDropContext>
  )
}

export default App