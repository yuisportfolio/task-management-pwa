import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

function DesktopView({ members, hours, tasks, deleteTask, setInput, input }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200 max-w-6xl mx-auto">
      <table className="table table-pin-rows table-pin-cols w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <th className="bg-slate-50 border-r border-slate-200 w-32 z-20">担当者 / 時刻</th>
            {hours.map(time => (
              <th key={time} className="text-center font-bold py-4 min-w-[120px] border-l border-slate-100">{time}</th>
            ))}
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
                          {cellTasks.map((task, index) => (
                            <TaskCard key={task.id} index={index} task={task} onDelete={() => deleteTask(task.id, task.title)} />
                          ))}
                          {cellTasks.length === 0 && (
                            <button
                              className="btn btn-ghost btn-xs w-full h-full min-h-[60px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => setInput({ ...input, member, time })}
                            > + 予約 </button>
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
  );
}

export default DesktopView;