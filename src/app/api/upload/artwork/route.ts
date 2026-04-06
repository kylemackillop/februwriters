import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/auth'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ARTWORK_MAX_BYTES = 3 * 1024 * 1024
const VALID_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png'])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  if (!VALID_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'WRONG_FORMAT', message: 'Only JPG and PNG files are accepted.' }, { status: 400 })
  }

  if (file.size > ARTWORK_MAX_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    return NextResponse.json(
      { error: 'FILE_TOO_LARGE', message: `Your file is ${sizeMB}MB. The limit is 3MB.`, sizeMB },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'februwriters/artwork',
          transformation: [{ crop: 'fill', gravity: 'center', width: 1000, height: 1000 }],
        },
        (error, res) => {
          if (error || !res) reject(error ?? new Error('Cloudinary upload failed'))
          else resolve(res as { secure_url: string })
        }
      )
      stream.end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('[artwork upload]', err)
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Upload failed. Try again.' }, { status: 500 })
  }
}
