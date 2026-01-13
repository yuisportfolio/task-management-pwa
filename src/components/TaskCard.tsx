import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

// 1. Taskそのものの形を定義
interface Task {
  id: number;
  title: string;
  member: string;
  time: string;
  priority?: 'high' | 'low'; // ? は「あってもなくても良い」という意味
}

// 2. TaskCardが受け取るPropsの型を定義
interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: () => void; // 引数なし、戻り値なしの関数という意味
}

// 3. コンポーネントに型を適用
const TaskCard: React.FC<TaskCardProps> = ({ task, index, onDelete }) => {
  
  // 優先度によってバッジの色を変えるロジック（ここはJSと同じでOK）
  const priorityColor = task.priority === 'high' ? 'badge-error text-white' : 'badge-info text-white';

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={onDelete}
          className={`card bg-white shadow-sm border border-slate-200 transition-all cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary ring-opacity-50 z-50' : 'hover:shadow-md'}
          `}
        >
          <div className="p-2 flex flex-col gap-1">
            <h3 className="text-xs font-bold text-slate-700 leading-tight break-words">
              {task.title}
            </h3>

            <div className="flex justify-between items-center mt-1">
              <span className={`badge ${priorityColor} badge-xs text-[10px] py-1`}>
                {task.priority === 'high' ? '至急' : '通常'}
              </span>

              <span className="text-[9px] text-slate-400 font-mono">
                #{task.id.toString().slice(-4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;