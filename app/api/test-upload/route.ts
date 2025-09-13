import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Ensure bucket exists (create if missing) and upload
    const ensureBucket = async (): Promise<void> => {
      try {
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        const exists = (buckets || []).some((b: { name: string }) => b.name === 'report-images')
        if (!exists) {
          await supabaseAdmin.storage.createBucket('report-images', {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024,
            allowedMimeTypes: ['image/*']
          })
        }
      } catch (e) {
        // Non-fatal: continue to upload attempt
        console.warn('Bucket check/create failed (continuing):', e)
      }
    }

    await ensureBucket()

    const attemptUpload = async () => {
      return await supabaseAdmin.storage
        .from('report-images')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        })
    }

    let { error } = await attemptUpload()
    if (error) {
      console.warn('Initial upload failed, retrying once...', error)
      await ensureBucket()
      const retry = await attemptUpload()
      error = retry.error
    }

    if (error) {
      console.error('Error uploading to Supabase:', error)
      return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('report-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Error in test upload API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
