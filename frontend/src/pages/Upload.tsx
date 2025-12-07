import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUpload, FiVideo } from 'react-icons/fi'
import { videoService } from '@/services/videoService'
import toast from 'react-hot-toast'

export default function Upload() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null as File | null,
    thumbnail: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'videoFile' | 'thumbnail') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, [type]: file })
      if (type === 'thumbnail') {
        const reader = new FileReader()
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.videoFile || !formData.thumbnail) {
      toast.error('Video and thumbnail are required')
      return
    }

    setLoading(true)

    try {
      await videoService.uploadVideo(formData as any)
      toast.success('Video uploaded successfully!')
      navigate('/my-channel')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-gray-400">Share your content with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="Enter video title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="textarea-field h-32"
            placeholder="Tell viewers about your video"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Video File</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 transition-smooth bg-gray-900/30">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'videoFile')}
                className="hidden"
                id="videoFile"
                required
              />
              <label htmlFor="videoFile" className="cursor-pointer block">
                {formData.videoFile ? (
                  <div className="space-y-2">
                    <FiVideo className="w-12 h-12 mx-auto text-green-500" />
                    <p className="text-sm text-green-500 font-medium">{formData.videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-300 font-medium">Click to upload video</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, WebM, or OGG</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 transition-smooth bg-gray-900/30">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                className="hidden"
                id="thumbnail"
                required
              />
              <label htmlFor="thumbnail" className="cursor-pointer block">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-32 object-cover rounded" />
                ) : (
                  <>
                    <FiUpload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-300 font-medium">Click to upload thumbnail</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-4 h-4" />
                <span>Upload Video</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
