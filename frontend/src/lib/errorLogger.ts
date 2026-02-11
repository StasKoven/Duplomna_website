/**
 * Global error logger for frontend
 */

export const logError = (context: string, error: any, additionalInfo?: any) => {
  console.error('\n❌ ========== FRONTEND ERROR ==========');
  console.error('📍 Context:', context);
  console.error('💬 Message:', error?.message || error);
  
  if (error?.response) {
    console.error('🔴 Response Status:', error.response.status);
    console.error('🔴 Response Data:', error.response.data);
  }
  
  if (error?.request && !error?.response) {
    console.error('🔴 No Response Received');
    console.error('🔴 Request:', error.request);
  }
  
  if (error?.config) {
    console.error('⚙️ Config:', {
      method: error.config.method,
      url: error.config.url,
      baseURL: error.config.baseURL,
    });
  }
  
  if (additionalInfo) {
    console.error('ℹ️ Additional Info:', additionalInfo);
  }
  
  if (error?.stack) {
    console.error('📚 Stack:', error.stack);
  }
  
  console.error('======================================\n');
};

export const logWarning = (context: string, message: string, data?: any) => {
  console.warn('\n⚠️ ========== FRONTEND WARNING ==========');
  console.warn('📍 Context:', context);
  console.warn('💬 Message:', message);
  if (data) {
    console.warn('ℹ️ Data:', data);
  }
  console.warn('=========================================\n');
};

export const logInfo = (context: string, message: string, data?: any) => {
  console.log('\nℹ️ ========== INFO ==========');
  console.log('📍 Context:', context);
  console.log('💬 Message:', message);
  if (data) {
    console.log('ℹ️ Data:', data);
  }
  console.log('=============================\n');
};
