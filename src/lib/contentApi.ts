const CONTENT_API_URL = 'https://functions.poehali.dev/75f35e00-3b1b-424f-8c93-684dfbd64afd';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  userRole?: string;
  userEmail?: string;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, userRole, userEmail } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (userRole) headers['X-User-Role'] = userRole;
  if (userEmail) headers['X-User-Email'] = userEmail;

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${CONTENT_API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ========== NEWS API ==========
export const newsApi = {
  async getAll() {
    const data = await apiRequest('?type=news');
    return data.news || [];
  },

  async create(newsData: any, userEmail: string, userRole: string) {
    return apiRequest('?type=news', {
      method: 'POST',
      body: newsData,
      userEmail,
      userRole,
    });
  },

  async update(newsData: any, userEmail: string, userRole: string) {
    return apiRequest('?type=news', {
      method: 'PUT',
      body: newsData,
      userEmail,
      userRole,
    });
  },

  async delete(id: number, userEmail: string, userRole: string) {
    return apiRequest(`?type=news&id=${id}`, {
      method: 'DELETE',
      userEmail,
      userRole,
    });
  },
};

// ========== DOCUMENTS API ==========
export const documentsApi = {
  async getAll() {
    const data = await apiRequest('?type=documents');
    return data.documents || [];
  },

  async create(documentData: any, userEmail: string, userRole: string) {
    return apiRequest('?type=documents', {
      method: 'POST',
      body: documentData,
      userEmail,
      userRole,
    });
  },

  async delete(id: number, userEmail: string, userRole: string) {
    return apiRequest(`?type=documents&id=${id}`, {
      method: 'DELETE',
      userEmail,
      userRole,
    });
  },
};

// ========== PAGES API ==========
export const pagesApi = {
  async getAll() {
    return apiRequest('?type=pages');
  },

  async getOne(pageKey: string) {
    return apiRequest(`?type=pages&key=${pageKey}`);
  },

  async update(pageKey: string, content: any, userEmail: string, userRole: string) {
    return apiRequest('?type=pages', {
      method: 'PUT',
      body: { key: pageKey, content },
      userEmail,
      userRole,
    });
  },
};

// ========== MIGRATION UTILITY ==========
export const migrateLocalStorageToDb = async (userEmail: string, userRole: string) => {
  const migrations = [];

  // Migrate news
  try {
    const newsData = localStorage.getItem('snt_news');
    if (newsData) {
      const news = JSON.parse(newsData);
      for (const item of news) {
        try {
          await newsApi.create({
            title: item.title,
            text: item.text,
            category: item.category,
            images: item.images || [],
            showOnMainPage: item.showOnMainPage,
            mainPageExpiresAt: item.mainPageExpiresAt,
          }, userEmail, userRole);
          migrations.push(`News: ${item.title}`);
        } catch (e) {
          console.error('Failed to migrate news:', item.title, e);
        }
      }
    }
  } catch (e) {
    console.error('Failed to migrate news:', e);
  }

  // Migrate pages (rules, contacts, gallery, home)
  try {
    const pagesData = localStorage.getItem('pages_content');
    if (pagesData) {
      const pages = JSON.parse(pagesData);
      for (const [key, content] of Object.entries(pages)) {
        try {
          await pagesApi.update(key, content, userEmail, userRole);
          migrations.push(`Page: ${key}`);
        } catch (e) {
          console.error(`Failed to migrate page ${key}:`, e);
        }
      }
    }
  } catch (e) {
    console.error('Failed to migrate pages:', e);
  }

  // Migrate site content (home page)
  try {
    const siteData = localStorage.getItem('site_content');
    if (siteData) {
      const content = JSON.parse(siteData);
      await pagesApi.update('home', content, userEmail, userRole);
      migrations.push('Page: home');
    }
  } catch (e) {
    console.error('Failed to migrate home page:', e);
  }

  return migrations;
};
