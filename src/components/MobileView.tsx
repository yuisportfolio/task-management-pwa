//import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

function MobileView({ members,hours, tasks, deleteTask, setInput, input }) {
  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      {hours.map((time) => {
        const droppableId = `mobile-${time}`;
        const cellTasks = tasks.filter(t => {
          const formattedDBTime = t.start_time?.substring(0, 5);
          return formattedDBTime === time && members.includes(t.member);
        });
        return (
          <div key={time} className="flex gap-3">
            <div className="w-12 pt-2 text-sm font-bold text-slate-500">{time}</div>
            <div className="flex-grow">
              <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[70px] p-2 rounded-lg border-2 border-dashed transition-all ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-100'}`}
                  >
                    {cellTasks.map((task, index) => (
                      <div key={task.id} className="mb-2 p-1 bg-white rounded border border-slate-200 shadow-sm">
                        <div className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded w-fit mb-1">
                          担当：{task.member}
                        </div>
                        <TaskCard index={index} task={task} onDelete={() => deleteTask(task.id, task.title)} />
                      </div>
                    ))}
                    {cellTasks.length === 0 && (
                      <button className="w-full h-10 text-slate-300 text-xs flex items-center justify-center" onClick={() => setInput({ ...input, startTime: time })}
                      > + 追加 </button>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MobileView;