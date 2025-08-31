import { storageService } from './storage-service'

/**
 * Initialize Supabase Storage for thumbnails
 * Run this function when setting up your application
 */
export async function initializeStorage() {
  try {
    console.log('🚀 Initializing Supabase Storage...')
    
    // Create the thumbnails bucket
    await storageService.initializeBucket()
    
    // Get bucket info to verify
    const bucketInfo = await storageService.getBucketInfo()
    console.log('✅ Storage initialized successfully:', bucketInfo)
    
    return true
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error)
    throw error
  }
}

/**
 * Test storage functionality
 */
export async function testStorage() {
  try {
    console.log('🧪 Testing storage functionality...')
    
    // Test bucket info
    const bucketInfo = await storageService.getBucketInfo()
    console.log('📦 Bucket info:', bucketInfo)
    
    // Test listing (should be empty initially)
    const chatFiles = await storageService.listChatThumbnails('test-chat')
    console.log('📁 Test chat files:', chatFiles)
    
    console.log('✅ Storage test completed successfully')
    return true
  } catch (error) {
    console.error('❌ Storage test failed:', error)
    throw error
  }
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  // Server-side execution
  initializeStorage()
    .then(() => testStorage())
    .catch(console.error)
}
