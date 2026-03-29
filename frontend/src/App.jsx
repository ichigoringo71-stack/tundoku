import { useState, useEffect } from 'react'
import axios from 'axios'
import { BookOpen, Trash2, PlusCircle } from 'lucide-react'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading]=useState(true)

  const [title, setTitle]=useState('')
  const [reason, setReason]=useState('')

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
              {/* あとで削除ボタンなどの機能をここに追加できます */}
            </div>
          ))
        )}
      </main>
    </div>
  )
}
export default App
