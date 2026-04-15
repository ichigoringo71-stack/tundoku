import { useState, useEffect } from 'react'
import axios from 'axios'
import { BookOpen, Trash2, PlusCircle, MessageCircle, Search, Check } from 'lucide-react'
import './index.css'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading]=useState(true)

  const [title, setTitle]=useState('')
  const [reason, setReason]=useState('')

  const [editingReviewId, setEditingReviewId]=useState(null)
  const [tempReview, setTempReview]=useState('')

  const [filterStatus, setFilterStatus]=useState('all')

  //検索用の状態
  const [searchQuery, setSearchQuery]=useState('')
  const [searchResults, setSearchResults]=useState([])
  const [isSearching, setIsSearching]=useState(false)

  //Google Books APIで検索する関数
  const handleSearch=async()=>{
    if(!searchQuery) return
    setIsSearching(true)
    try{
      const res=await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}`)
      //上位五件を表示
      setSearchResults(res.data.items || [])
    }catch(err){
      console.error("検索エラー:", err)
    }finally{
      setIsSearching(false)
    }
  }

  //候補から本を選択した時の処理関数
  const selectBook=(bookInfo)=>{
    setTitle(bookInfo.title)
    setSearchResults([])
    setSearchQuery('')
  }

  //1. python APIからデータを取得する関数
  const fetchBooks=async()=>{
    try{
      const response=await axios.get('https://tundoku-api.onrender.com/books')
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
      await axios.post(`https://tundoku-api.onrender.com/books?title=${title}&reason=${reason}`)

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
      await axios.delete(`https://tundoku-api.onrender.com/books/${id}`)

      fetchBooks()
    } catch(error){
      console.error("削除に失敗しました:", error)
      alert("削除中にエラーが発生しました")
    }
  }

  const handleUpdateStatus=async(id, newStatus)=>{
    try{
      //バックエンドの PATCH /books/{book_id} を叩く, クエリパラメータとして status を送る形式
      await axios.patch(`https://tundoku-api.onrender.com/books/${id}?status=${newStatus}`)

      //更新に成功したらリストを再取得
      fetchBooks()
    } catch(error){
      console.error("ステータスの更新に失敗しました:", error)
    }
  }

  const handleUpdateReview=async(id)=>{
    try{
      await axios.patch(`https://tundoku-api.onrender.com/books/${id}?review=${tempReview}`)
      setEditingReviewId(null)
      setTempReview('')
      fetchBooks()
    } catch(error){
      console.error("感想の保存失敗:", error)
    }
  }

  const filteredBooks=books.filter(book=>{
    if(filterStatus==='all') return true;
    return book.status===filterStatus;
  });

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
        {/* ---検索セクション--- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-blue-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search size={20} className="text-blue-500" /> 本を検索して入力
          </h2>
          <div className="mb-4">
            <form onSubmit={(e)=>{
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2 w-full"
            >
              <input
                type="text"
                placeholder="本の名前を入力..."
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
            </form>
            
          </div>
        </div>

        {/* ---検索結果の表示--- */}
        {searchResults.length > 0 && (
          <div className="space-y-2 border-t pt-4 max-h-60 overflow-y-auto">
            {searchResults.map((item)=>(
              <div
                key={item.id}
                onClick={()=>selectBook(item.volumeInfo)}
                className="flex items-center gap-3 p-2 hover:bd-blue-50 cursor-pointer rounded-md transition"
              >
                {item.volumeInfo.imageLinks?.smallThumbnail && (
                  <img src={item.volumeInfo.imageLinks.smallThumbnail} alt="cover" className="w-10 h-14 object-cover rounded shadow-sm" />
                )}
                <div>
                  <p className="text-sm font-bold">{item.volumeInfo.title}</p>
                  <p className="text-xs text-gray-500">{item.volumeInfo.authors?.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
           placeholder="読みたい理由"
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
        {/* ---タブ切り替えボタン--- */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm md-6 border-gray-200">
          {[
            { id: 'all', label: '全て'},
            { id: 'unread', label: '未読'},
            { id: 'reading', label: '進行中'},
            { id: 'completed', label: '読了'},
          ].map((tab)=>(
            <button
             key={tab.id}
             onClick={()=>setFilterStatus(tab.id)}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              filterStatus===tab.id
              ? 'bg-blue-500 text-white shadow'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
             }`}
            >
             {tab.label}
            </button>
          ))}
        </div>

        {/* ---フィルタリングされたリスト表示--- */}
        <div className="space-y-4">
          {filteredBooks.length===0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-bashed border-gray-200">
              <p className="text-gray-400">該当する本がありません</p>
            </div>
          ):(
            filteredBooks.map((book)=>(
              <div key={book.id} className="bg-white p-4 rounded-lg shadow space-y-4">
               <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                  <p className="text-sm text-gray-600">理由: {book.reason}</p>
                  <div classNmae="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      book.status==='completed' ? 'bg-green-100 text-green-700'
                      : book.status==='reading' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {book.status==='completed' ? '読了' : book.status==='reading' ? '進行中' : '未読'}
                    </span>
                  </div>
               </div>

               {/* ---削除ボタン--- */}
               <button
                 onClick={()=>handleDelete(book.id)}
                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
                 title="削除"
               >
                 <Trash2 size={20} />
               </button>
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
          </div>
        ))
      )}
    </div>
  </main>
</div>
  )
}

export default App
