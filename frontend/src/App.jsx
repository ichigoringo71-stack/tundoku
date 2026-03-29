import { useState, useEffect } from 'react'
import axios from 'axios'
import { BookOpen, Trash2, PlusCircle, MessageCircle, Check } from 'lucide-react'
import './index.css'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading]=useState(true)

  const [title, setTitle]=useState('')
  const [reason, setReason]=useState('')

  const [editingReviewId, setEditingReviewId]=useState(null)
  const [tempReview, setTempReview]=useState('')

  //1. python APIからデータを取得する関数
  const fetchBooks=async()=>{
    try{
      const response=await axios.get('http://127.0.0.1:8000/books')
      setBooks(response.data)
      setLoading(false)
    } catch(error){
      console.error("データの取得に失敗しました:", error)
      setLoading(false)
    }
  }

  const handleSubmit=async(e)=>{
    e.preventDefault()
    if(!title||!reason) return alert('タイトルと読みたいと思った理由を入力してください')
    
    try{
      //pythonのPOSTエンドポイントにデータを送る
      await axios.post(`http://127.0.0.1:8000/books?title=${title}&reason=${reason}`)

      setTitle('')
      setReason('')

      fetchBooks()
    } catch(error){
      console.error("登録に失敗しました:", error)
    }
  }

  const handleDelete=async(id)=>{
    if(!window.confirm("この本をリストから削除しますか？")) return
    try{
      await axios.delete(`http://127.0.0.1:8000/books/${id}`)

      fetchBooks()
    } catch(error){
      console.error("削除に失敗しました:", error)
      alert("削除中にエラーが発生しました")
    }
  }

  const handleUpdateStatus=async(id, newStatus)=>{
    try{
      //バックエンドの PATCH /books/{book_id} を叩く, クエリパラメータとして status を送る形式
      await axios.patch(`http://127.0.0.1:8000/books/${id}?status=${newStatus}`)

      //更新に成功したらリストを再取得
      fetchBooks()
    } catch(error){
      console.error("ステータスの更新に失敗しました:", error)
    }
  }

  const handleUpdateReview=async(id)=>{
    try{
      await axios.patch(`http://127.0.0.1:8000/books/${id}?review=${tempReview}`)
      setEditingReviewId(null)
      setTempReview('')
      fetchBooks()
    } catch(error){
      console.error("感想の保存失敗:", error)
    }
  }

  //2. 画面が開いた瞬間に実行する
  useEffect(()=>{
    fetchBooks()
  }, [])

  if(loading) return <div className="p-8">読み込み中...</div>

  return(
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
          <BookOpen className="text-blue-500" /> tundoku
        </h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {/* ---登録フォーム--- */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle size={20} /> 新しい本を追加
          </h2>
          <input
           type="text"
           placeholder="本のタイトル"
           value={title}
           onChange={(e)=>setTitle(e.target.value)}
           className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <textarea
           placeholfer="読みたい理由"
           value={reason}
           onChange={(e)=>setReason(e.target.value)}
           className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
           type="submit"
           className="w-full bg-blue-500 text-white pt-2 rounded hover:bg-blue-600 transition"
          >
            積読リストに入れる
          </button>
        </form>
        {/* ---リスト表示--- */ }
        {books.length===0?(
          <p className="text-center text-gray-500">まだ本が登録されていません</p>
        ):(
          books.map((book)=>(
            <div key={book.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                <p className="text-sm text-gray-600">理由:{book.reason}</p>
                <span className={`text-xl px-2 py-1 rounded ${
                  book.status==='completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {book.status}
                </span>
                
              </div>
              {/* ---ステータス切り替えボタン--- */}
              <div className="flex gap-2">
                <button
                onClick={()=>handleUpdateStatus(book.id, 'unread')}
                className={`text-xs px-2 py-1 rounded border ${book.status==='unread' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}
                >
                  未読
                </button>
                <button
                onClick={()=>handleUpdateStatus(book.id, 'reading')}
                className={`text-xs px-2 py-1 rounded border ${book.status==='reading' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500'}`}
                >
                  進行中
                </button>
                <button
                onClick={()=>handleUpdateStatus(book.id, 'completed')}
                className={`text-xs px-2 py-1 rounded border ${book.status==='completed' ? 'bg-green-500 text-white' : 'bg-white text-gray-500'}`}
                >
                  読了！
                </button>
              </div>

              {/* ---感想エリア(条件付きレンダリング)--- */}
              {book.status==='completed' && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                 {editingReviewId===book.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                     value={tempReview}
                     onChange={(e)=>setTempReview(e.target.value)}
                     placeholder="一言感想を入力..."
                     className="w-full p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                     onClick={()=>handleUpdateReview(book.id)}
                     className="self-end bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-green-600"
                    >
                      <Check size={14} />保存
                    </button>
                  </div>
                 ):(
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm italic text-green-800 flex items-start gap-2">
                      <MessageCircle size={16} className="mt-1 flex-shrink-0" />
                      {book.review || "まだ感想がありません。"}
                    </p>
                    <button
                     onClick={()=>{
                      setEditingReviewId(book.id);
                      setTempReview(book.review || '');
                     }}
                     className="text-xs text-green-600 font-bold hover:underline"
                    >
                      編集
                    </button>
                  </div>
                 )}
                </div> 
              )}
              {/* ---削除ボタン--- */}
              <button
               onClick={()=>handleDelete(book.id)}
               className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
               title="削除"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
export default App
