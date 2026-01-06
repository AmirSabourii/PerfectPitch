'use client'

export default function LoadingSpinner() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mb-6"></div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          در حال تحلیل پیچ دک...
        </h3>
        <p className="text-gray-600">
          هوش مصنوعی در حال بررسی متن و تصاویر اسلایدهای شما است
        </p>
      </div>
    </div>
  )
}

