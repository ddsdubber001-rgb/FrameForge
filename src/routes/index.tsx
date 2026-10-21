import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useRef } from 'react'
import { 
  Upload, Search, Sparkles, Download, 
  Film, RefreshCw, Sliders, Image as ImageIcon 
} from 'lucide-react'
import { searchMedia } from '../services/api'
import { exportTo4KCanvas } from '../utils/canvas'
import { MediaItem, OverlaySettings } from '../types'

export const Route = createFileRoute('/')({
  component: FrameForgeHome,
})

function FrameForgeHome() {
  const [bgImage, setBgImage] = useState<string>('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MediaItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  
  const [settings, setSettings] = useState<OverlaySettings>({
    title: 'Cyberpunk Edgerunners',
    secondaryTitle: 'サイバーパンク エッジランナーズ',
    rating: '8.6 / 10',
    status: 'Completed',
    genres: ['Action', 'Sci-Fi', 'Cyberpunk', 'Animation'],
    year: '2024',
    overlayStyle: 'cinematic',
    fontFamily: 'Outfit',
    accentColor: '#38bdf8',
    opacity: 85
  })

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const imageElementRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = bgImage
    img.onload = () => {
      imageElementRef.current = img
      updateLivePreview()
    }
  }, [bgImage])

  useEffect(() => {
    updateLivePreview()
  }, [settings])

  const updateLivePreview = async () => {
    try {
      const dataUrl = await exportTo4KCanvas(imageElementRef.current, settings)
      setPreviewDataUrl(dataUrl)
    } catch (e) {
      console.error('Preview render error:', e)
    }
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true)
        const results = await searchMedia(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item)
    setBgImage(item.imageUrl)
    setSettings(prev => ({
      ...prev,
      title: item.title,
      rating: typeof item.rating === 'string' ? item.rating : `${item.rating} / 10`,
      status: item.status,
      genres: item.genres,
      year: item.year
    }))
    setSearchResults([])
    setSearchQuery('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownload4K = async () => {
    setIsExporting(true)
    try {
      const dataUrl = await exportTo4KCanvas(imageElementRef.current, settings)
      const link = document.createElement('a')
      link.download = `${settings.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-4k-frameforge.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              FRAMEFORGE <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold ml-2">4K STUDIO</span>
            </h1>
            <p className="text-xs text-slate-400">Professional Anime & Movie Poster Generator</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleDownload4K}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Rendering 4K...' : 'Export 4K PNG'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1800px] mx-auto w-full">
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center space-x-2 text-indigo-400">
                <Search className="w-4 h-4" />
                <span>ADD DETAILS (API SEARCH)</span>
              </label>
              <span className="text-xs text-slate-500">Jikan & TVMaze</span>
            </div>
            
            <div className="relative">
              <input 
                type="text"
                placeholder="Search anime or movie (e.g., Naruto, Interstellar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-3.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 divide-y divide-slate-800">
                  {searchResults.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSelectMedia(item)}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.year} • ★ {item.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
            <label className="text-sm font-bold flex items-center space-x-2 text-cyan-400">
              <Upload className="w-4 h-4" />
              <span>UPLOAD IMAGE BACKGROUND</span>
            </label>
            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 transition-all group">
              <ImageIcon className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
              <span className="text-sm font-medium text-slate-300">Click to upload custom poster</span>
              <span className="text-xs text-slate-500 mt-1">Preserves original aspect ratio & background</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4 flex-1">
            <label className="text-sm font-bold flex items-center space-x-2 text-emerald-400">
              <Sliders className="w-4 h-4" />
              <span>SMART OVERLAY CONTROLS</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Title</label>
                <input 
                  type="text" 
                  value={settings.title}
                  onChange={(e) => setSettings({...settings, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Secondary Title / Subtitle</label>
                <input 
                  type="text" 
                  value={settings.secondaryTitle}
                  onChange={(e) => setSettings({...settings, secondaryTitle: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Rating</label>
                  <input 
                    type="text" 
                    value={settings.rating}
                    onChange={(e) => setSettings({...settings, rating: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Status</label>
                  <input 
                    type="text" 
                    value={settings.status}
                    onChange={(e) => setSettings({...settings, status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Overlay Style</label>
                  <select 
                    value={settings.overlayStyle}
                    onChange={(e) => setSettings({...settings, overlayStyle: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cinematic">Cinematic Gradient</option>
                    <option value="minimal">Minimalist Dark</option>
                    <option value="cyberpunk">Cyberpunk Neon</option>
                    <option value="glass">Glass Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Font Family</label>
                  <select 
                    value={settings.fontFamily}
                    onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Inter">Inter</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Orbitron">Orbitron</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={settings.accentColor}
                      onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                      className="w-10 h-9 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.accentColor}
                      onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Opacity ({settings.opacity}%)</label>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    value={settings.opacity}
                    onChange={(e) => setSettings({...settings, opacity: Number(e.target.value)})}
                    className="w-full mt-2 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-200">LIVE PREVIEW (4K Canvas Render)</span>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">3840 × 2160 Ratio Scale</span>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[550px] shadow-2xl relative">
            {previewDataUrl ? (
              <img 
                src={previewDataUrl} 
                alt="Live Preview" 
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-slate-800/50"
              />
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm text-slate-400">Rendering high-quality preview...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
