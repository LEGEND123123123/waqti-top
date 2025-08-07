
// Mock Supabase service for offline demo
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback) => {
      // Mock auth state
      setTimeout(() => callback('INITIAL_SESSION', null), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: ({ email, password }) => {
      console.log('Demo: Would sign up', email);
      return Promise.resolve({ 
        data: { user: { id: 'demo-user', email } }, 
        error: null 
      });
    },
    signInWithPassword: ({ email, password }) => {
      console.log('Demo: Would sign in', email);
      return Promise.resolve({ 
        data: { user: { id: 'demo-user', email } }, 
        error: null 
      });
    },
    signOut: () => {
      console.log('Demo: Would sign out');
      return Promise.resolve({ error: null });
    },
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  },
  from: (table) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      })
    }),
    insert: (data) => {
      console.log('Demo: Would insert into', table, data);
      return Promise.resolve({ data: null, error: null });
    }
  })
};
