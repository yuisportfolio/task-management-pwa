
import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';
import { supabase } from './supabaseClient';
//import { UNSAFE_getTurboStreamSingleFetchDataStrategy } from 'react-router-dom'; React Router のサーバーサイドレンダリング (SSR) 機能

// --- 型の定義（宣言文）------------------------------------------------

//タスク
export interface Task {
  id: number;
  created_at?: string; // Supabaseが自動付与する時間（任意）
  title: string;
  member: string;
  start_time: string; // "09:00" など
  end_time: string;   // "10:00" など
  date: string;       // "2024-01-14" など
  priority: 'high' | 'low';
}
//入力フォーム
interface InputState {
  title: string;
  member: string;
  startTime: string; // "09:00" など
  endTime: string;   // "10:00" など
  date: string;       // "2024-01-14" など
  priority: 'high' | 'low';
}

const App: React.FC = () => {
  // --- 定数 ---
  const members: string[] = ["田中", "佐藤", "鈴木", "高橋"];
  const hours: string[] = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  //　通知の許可
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('通知が許可されました！');
    }
  };

  // --- Stateの定義（型を指定） ---
  const [tasks, setTasks] = useState<Task[]>([]);
  
//==================================================================
//　DBからデータ取得
//==================================================================
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id,created_at,title,member,start_time,end_time,priority')
        .order('id', { ascending: true });

      if (error) {
        console.error('★Supabaseからエラーが返った:', error);
      } else {
        // ここで秒数をトリム(09:00:00 -> 09:00)しておく
        const formattedData = data.map(t => ({
          ...t,
          start_time: t.start_time?.substring(0, 5),
          end_time: t.end_time?.substring(0, 5)
        }));
        setTasks(formattedData as Task[]);
      }
    } catch (err) {
      console.error('★通信自体が失敗した:', err);
    }
  };
//==================================================================
// 副作用（起動時に実行）
//==================================================================
  useEffect(() => {
    fetchTasks();

  // リアルタイム監視・リスナーの登録-------------------------------------
    const channel = supabase
      .channel('tasks-realtime') // 任意の名前
      .on(
        'postgres_changes',
        {
          event: '*', // 追加・更新・削除すべてを監視
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('DB変更を検知しました:', payload);
          // 変更があったらデータを再取得する
          fetchTasks(); 
        }
      )
      .subscribe();

    // コンポーネントが消えるときに監視を解除（メモリリーク防止）
    return () => {
      supabase.removeChannel(channel);
    };

  // バッジ処理（数字削除）----------------------------------------------
  navigator.clearAppBadge();
  }, []);

  //　入力フォームの規定値設定--------------------------------------------
  const [input, setInput] = useState<InputState>({
    title: "",
    member: "田中",
    startTime: "09:00",
    endTime: "11:00",
    date: new Date().toLocaleDateString('sv-SE'),
    priority: "low"
  });

  // レスポンシブ設定----------------------------------------------------
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // ウィンドウサイズ
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

//==================================================================
// ロジック（型安全な関数）
//==================================================================

  //タスクの追加---------------------------------------------------
  const addTask = async () => {
    if (!input.title) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: input.title,
          member: input.member,
          start_time: input.startTime,
          end_time: input.endTime,
          date: input.date,
          priority: input.priority
        }
      ])
      .select();

    if (error) {
      console.error("保存失敗:", error);
    } else if (data) {

      // 通知を飛ばす---------------------------------------------------
      if (Notification.permission === 'granted') {
        new Notification('予約完了！', {
          body: `${input.member}さんの${input.title}を予約しました。`,
          icon: '/icon-192'
        });
      }
      // バッジつける---------------------------------------------------
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(tasks.length); // タスクの総数を表示
      }
      // 再取得して画面を更新
      await fetchTasks();
      setInput({ ...input, title: "" });
    }
  };

  // タスクの削除---------------------------------------------------
  const deleteTask = async (id: number, title: string) => {
    if (window.confirm(`「${title}」を削除しますか？`)) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id); // 指定したIDの行を消す

      if (error) {
        console.error("削除失敗:", error);
      } else {
        setTasks(tasks.filter(t => t.id !== id));
      }
    }
  };
  //ドラッグ&ドロップの処理---------------------------------------------
  const onDragEnd = async (result: DropResult): Promise<void> => {
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
      String(t.id) === draggableId ? { ...t, member: newMember, start_time: newTime } : t
    ));
    // 3. 【重要】Supabase のデータも更新する
    const { error } = await supabase
      .from('tasks')
      .update({
        member: newMember,
        start_time: newTime
      })
      .eq('id', draggableId); // ドラッグした要素のIDと一致する行を更新

    if (error) {
      console.error('DB更新エラー:', error);
      // 失敗した場合はデータを再取得して元に戻すとより親切です
      fetchTasks();
    }
  };

  // 子コンポーネントに渡す共通の道具（Props）------------------------------
  const commonProps = {
    members,
    hours,
    tasks,
    deleteTask,
    setInput,
    input
  };
//==================================================================
// 画面描画
//==================================================================
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full min-h-screen bg-slate-50 p-4 text-slate-800 font-sans">
        <header className="flex justify-between items-center mb-6 w-full mx-auto">
          <h1 className="text-2xl font-bold text-primary">本日の予定</h1>
          <button onClick={requestNotificationPermission} className="btn btn-outline btn-sm mb-4">
            🔔 通知を許可する
          </button>
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
              onChange={e => setInput({ ...input, title: e.target.value })}
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
            <select className="select select-bordered select-sm bg-white border-slate-300" value={input.startTime}
              onChange={e => setInput({ ...input, startTime: e.target.value })}>
              {hours.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-slate-600">終了時間</span></label>
            <select className="select select-bordered select-sm bg-white border-slate-300" value={input.endTime}
              onChange={e => setInput({ ...input, endTime: e.target.value })}>
              {hours.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-slate-600">優先度</span></label>
            <select className="select select-bordered select-sm bg-white border-slate-300" value={input.priority}
              onChange={e => setInput({ ...input, priority: e.target.value as 'high' | 'low' })}>
              <option value="low">低 (Low)</option>
              <option value="high">高 (High)</option>
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