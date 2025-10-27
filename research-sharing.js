// Research Sharing Platform - Complete JavaScript Implementation
// Developed by: D. Ferguson
// Module: Research Community & Collaboration

//========================
// GLOBAL STATE
//========================

let researchPlatform = {
  posts: [],
  userPosts: [],
  comments: {},
  votes: {},
  collaborations: []
};

//========================
// SEARCH & FILTER
//========================

function searchResearch() {
  const searchTerm = document.getElementById('research-search').value.toLowerCase();
  const toolkitFilter = document.getElementById('filter-toolkit').value;
  const validationFilter = document.getElementById('filter-validation').value;
  const sortBy = document.getElementById('filter-sort').value;
  
  // Track search
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'search',
      toolkit: toolkitFilter,
      validation: validationFilter
    });
  }
  
  // Filter posts
  let filteredPosts = researchPlatform.posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    
    const matchesToolkit = !toolkitFilter || post.toolkit === toolkitFilter;
    const matchesValidation = !validationFilter || post.validation === validationFilter;
    
    return matchesSearch && matchesToolkit && matchesValidation;
  });
  
  // Sort posts
  switch(sortBy) {
    case 'recent':
      filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'popular':
      filteredPosts.sort((a, b) => b.votes - a.votes);
      break;
    case 'discussed':
      filteredPosts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
      break;
  }
  
  // Display results
  displayResearchPosts(filteredPosts);
  
  showModal(`Found ${filteredPosts.length} posts`, 'info');
}

function displayResearchPosts(posts) {
  const container = document.getElementById('research-posts-container');
  
  if (posts.length === 0) {
    container.innerHTML = '<div class="card"><p style="color: var(--muted);">No posts found matching your criteria.</p></div>';
    return;
  }
  
  // Would render posts dynamically
  // For now, the example posts in HTML serve as templates
}

function loadMorePosts() {
  showModal('Loading more posts...', 'info');
  // Would load additional posts from backend
}

//========================
// POST INTERACTIONS
//========================

function votePost(postId, direction) {
  if (!currentUser) {
    showModal('Please log in to vote', 'error');
    return;
  }
  
  // Track vote
  if (!researchPlatform.votes[postId]) {
    researchPlatform.votes[postId] = {};
  }
  
  const previousVote = researchPlatform.votes[postId][currentUser.id] || 0;
  
  // If clicking same direction, remove vote
  if (previousVote === direction) {
    researchPlatform.votes[postId][currentUser.id] = 0;
  } else {
    researchPlatform.votes[postId][currentUser.id] = direction;
  }
  
  // Update display
  const voteCount = document.getElementById(`votes-${postId}`);
  const currentVotes = parseInt(voteCount.textContent);
  const change = (researchPlatform.votes[postId][currentUser.id] - previousVote);
  voteCount.textContent = currentVotes + change;
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'vote',
      postId: postId,
      direction: direction
    });
  }
}

function commentOnPost(postId) {
  if (!currentUser) {
    showModal('Please log in to comment', 'error');
    return;
  }
  
  const commentsSection = document.getElementById(`comments-${postId}`);
  
  if (commentsSection.style.display === 'none') {
    // Show comments
    commentsSection.style.display = 'block';
    loadComments(postId);
  } else {
    // Hide comments
    commentsSection.style.display = 'none';
  }
}

function loadComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  
  // Example comments
  const exampleComments = [
    {
      author: 'Dr. Jane Smith',
      institution: 'Harvard Medical School',
      timestamp: '1 day ago',
      content: 'Impressive results! Have you tried testing against other variants (Delta, Omicron)?',
      avatar: 'J'
    },
    {
      author: 'Prof. Robert Lee',
      institution: 'UC Berkeley',
      timestamp: '18 hours ago',
      content: 'Great work on the validation. The SPR data looks very clean. Could you share your expression protocol?',
      avatar: 'R'
    }
  ];
  
  let html = '<h4>Comments</h4>';
  
  exampleComments.forEach(comment => {
    html += `
      <div class="comment-item" style="margin: 16px 0; padding: 16px; background: var(--panel); border-radius: 8px;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div class="user-avatar-small">${comment.avatar}</div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <strong>${comment.author}</strong>
                <span style="color: var(--muted); font-size: 12px;"> • ${comment.institution}</span>
              </div>
              <span style="color: var(--muted); font-size: 12px;">${comment.timestamp}</span>
            </div>
            <p style="margin: 0; line-height: 1.6;">${comment.content}</p>
            <div style="margin-top: 8px;">
              <button class="btn btn-sm btn-outline" onclick="replyToComment()">Reply</button>
              <button class="btn btn-sm btn-outline" onclick="likeComment()">👍 Like</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  // Add comment form
  html += `
    <div style="margin-top: 20px;">
      <textarea id="new-comment-${postId}" rows="3" placeholder="Add a comment..." 
        style="width: 100%; padding: 12px; background: var(--panel); border: 1px solid var(--line); 
        border-radius: 8px; color: var(--text); resize: vertical;"></textarea>
      <button class="btn btn-primary" onclick="submitComment('${postId}')" style="margin-top: 8px;">
        Post Comment
      </button>
    </div>
  `;
  
  commentsSection.innerHTML = html;
}

function submitComment(postId) {
  const textarea = document.getElementById(`new-comment-${postId}`);
  const content = textarea.value.trim();
  
  if (!content) {
    showModal('Please enter a comment', 'error');
    return;
  }
  
  // Add comment (would save to backend)
  showModal('Comment posted!', 'success');
  textarea.value = '';
  
  // Reload comments
  loadComments(postId);
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'comment',
      postId: postId
    });
  }
}

function replyToComment() {
  showModal('Reply functionality coming soon', 'info');
}

function likeComment() {
  showModal('Comment liked!', 'success');
}

function sharePost(postId) {
  const url = `https://computelab.com/research/post/${postId}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(url).then(() => {
    showModal('Link copied to clipboard!', 'success');
  }).catch(() => {
    showModal('Could not copy link', 'error');
  });
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'share',
      postId: postId
    });
  }
}

function citePost(postId) {
  document.getElementById('citation-modal').style.display = 'flex';
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'cite',
      postId: postId
    });
  }
}

function closeCitationModal() {
  document.getElementById('citation-modal').style.display = 'none';
}

function copyCitation(format) {
  const citationBox = document.getElementById(`citation-${format}`);
  const text = citationBox.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    showModal('Citation copied to clipboard!', 'success');
  });
}

function collaboratePost(postId) {
  if (!currentUser) {
    showModal('Please log in to collaborate', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>🤝 Request Collaboration</h2>
      
      <div class="form-group">
        <label>Your Expertise</label>
        <input type="text" id="collab-expertise" placeholder="e.g., High-throughput screening">
      </div>
      
      <div class="form-group">
        <label>What can you contribute?</label>
        <textarea id="collab-contribution" rows="4" 
          placeholder="Describe your resources, expertise, or interest in this project..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Proposed Timeline</label>
        <input type="text" id="collab-timeline" placeholder="e.g., 3-6 months">
      </div>
      
      <div class="btn-group">
        <button class="btn btn-primary" onclick="sendCollaborationRequest('${postId}')">
          Send Request
        </button>
        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function sendCollaborationRequest(postId) {
  const expertise = document.getElementById('collab-expertise').value;
  const contribution = document.getElementById('collab-contribution').value;
  const timeline = document.getElementById('collab-timeline').value;
  
  if (!expertise || !contribution) {
    showModal('Please fill in all fields', 'error');
    return;
  }
  
  // Send request (would save to backend)
  showModal('Collaboration request sent! The author will be notified.', 'success');
  
  document.querySelector('.modal').remove();
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'collaborate_request',
      postId: postId
    });
  }
}

function replicateStudy(postId) {
  showModal('Download study parameters to replicate this work', 'info');
  
  // Track action
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('research-sharing', {
      action: 'replicate',
      postId: postId
    });
  }
}

//========================
// CREATE POST
//========================

function publishPost() {
  if (!currentUser) {
    showModal('Please log in to publish posts', 'error');
    return;
  }
  
  // Validate required fields
  const title = document.getElementById('post-title').value.trim();
  const toolkit = document.getElementById('post-toolkit').value;
  const validation = document.getElementById('post-validation').value;
  const summary = document.getElementById('post-summary').value.trim();
  const methods = document.getElementById('post-methods').value.trim();
  const terms = document.getElementById('post-terms').checked;
  
  if (!title) {
    showModal('Please enter a title', 'error');
    return;
  }
  
  if (!toolkit) {
    showModal('Please select a toolkit', 'error');
    return;
  }
  
  if (!summary) {
    showModal('Please enter a summary', 'error');
    return;
  }
  
  if (!methods) {
    showModal('Please describe your computational methods', 'error');
    return;
  }
  
  if (!terms) {
    showModal('Please accept the terms', 'error');
    return;
  }
  
  // Create post object
  const post = {
    id: 'post_' + Date.now(),
    author: currentUser.name,
    authorId: currentUser.id,
    institution: currentUser.institution,
    timestamp: new Date().toISOString(),
    title: title,
    toolkit: toolkit,
    validation: validation,
    tags: document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(t => t),
    summary: summary,
    methods: methods,
    results: document.getElementById('post-results').value,
    validationDetails: document.getElementById('post-validation-details').value,
    discussion: document.getElementById('post-discussion').value,
    seekingCollab: document.getElementById('post-seeking-collab').checked,
    votes: 0,
    commentCount: 0
  };
  
  // Save post (would send to backend)
  researchPlatform.posts.push(post);
  researchPlatform.userPosts.push(post);
  
  // Track result
  if (typeof trackResult === 'function') {
    trackResult('research-sharing', {
      postId: post.id,
      toolkit: toolkit,
      validation: validation
    });
  }
  
  showModal('Post published successfully!', 'success');
  
  // Clear form
  document.getElementById('post-title').value = '';
  document.getElementById('post-summary').value = '';
  document.getElementById('post-methods').value = '';
  document.getElementById('post-results').value = '';
  document.getElementById('post-validation-details').value = '';
  document.getElementById('post-discussion').value = '';
  document.getElementById('post-tags').value = '';
  document.getElementById('post-seeking-collab').checked = false;
  document.getElementById('post-terms').checked = false;
  
  // Navigate to My Posts
  document.querySelector('[data-tab="my-posts"]').click();
  updateMyPosts();
}

function saveDraft() {
  if (!currentUser) {
    showModal('Please log in to save drafts', 'error');
    return;
  }
  
  const draft = {
    id: 'draft_' + Date.now(),
    title: document.getElementById('post-title').value,
    // ... save all fields
    savedAt: new Date().toISOString()
  };
  
  // Save draft to localStorage
  const drafts = JSON.parse(localStorage.getItem('research_drafts') || '[]');
  drafts.push(draft);
  localStorage.setItem('research_drafts', JSON.stringify(drafts));
  
  showModal('Draft saved!', 'success');
}

function previewPost() {
  const title = document.getElementById('post-title').value;
  const summary = document.getElementById('post-summary').value;
  
  if (!title || !summary) {
    showModal('Add title and summary to preview', 'error');
    return;
  }
  
  // Create preview modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>📋 Post Preview</h2>
      
      <div class="research-card">
        <h3 class="research-title">${title}</h3>
        <div class="research-meta">
          <div class="research-author">
            <div class="user-avatar-small">${currentUser ? currentUser.name.charAt(0) : 'U'}</div>
            <span><strong>${currentUser ? currentUser.name : 'User'}</strong> • ${currentUser ? currentUser.institution : 'Institution'}</span>
          </div>
        </div>
        <div class="research-content">
          <p>${summary}</p>
        </div>
      </div>
      
      <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close Preview</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateMyPosts() {
  const container = document.getElementById('user-posts-container');
  
  if (researchPlatform.userPosts.length === 0) {
    container.innerHTML = '<p style="color: var(--muted);">You haven\'t posted any research yet.</p>';
    return;
  }
  
  // Display user's posts
  let html = '';
  researchPlatform.userPosts.forEach(post => {
    html += `
      <div class="research-card">
        <h4>${post.title}</h4>
        <p style="color: var(--muted); font-size: 13px;">${new Date(post.timestamp).toLocaleDateString()}</p>
        <div class="research-actions">
          <button class="btn btn-sm btn-outline" onclick="editPost('${post.id}')">Edit</button>
          <button class="btn btn-sm btn-outline" onclick="deletePost('${post.id}')">Delete</button>
          <button class="btn btn-sm btn-outline" onclick="viewPostStats('${post.id}')">View Stats</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Update statistics
  document.getElementById('user-posts-count').textContent = researchPlatform.userPosts.length;
  
  const totalVotes = researchPlatform.userPosts.reduce((sum, post) => sum + (post.votes || 0), 0);
  document.getElementById('user-votes-received').textContent = totalVotes;
  
  const totalComments = researchPlatform.userPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
  document.getElementById('user-comments-received').textContent = totalComments;
}

function editPost(postId) {
  showModal('Edit post functionality', 'info');
}

function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    researchPlatform.userPosts = researchPlatform.userPosts.filter(p => p.id !== postId);
    researchPlatform.posts = researchPlatform.posts.filter(p => p.id !== postId);
    updateMyPosts();
    showModal('Post deleted', 'success');
  }
}

function viewPostStats(postId) {
  showModal('View detailed statistics for this post', 'info');
}

//========================
// COLLABORATIONS
//========================

function searchCollaborators() {
  const query = document.getElementById('collab-search').value;
  
  if (!query) {
    showModal('Please enter search terms', 'error');
    return;
  }
  
  showModal('Searching for collaborators with expertise in: ' + query, 'info');
  
  // Would search user database
}

//========================
// INITIALIZATION
//========================

// Initialize research platform when section is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load example posts
  researchPlatform.posts = [
    // Example posts would be loaded from backend
  ];
  
  // Set up event listeners
  document.querySelectorAll('.gene-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.gene-chip').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
});

//========================
// ATTRIBUTION
//========================

console.log('%c Research Sharing Platform ', 'background: linear-gradient(135deg, #34d399, #7dd3fc); color: white; font-size: 14px; font-weight: bold; padding: 6px;');
console.log('%c Developed by D. Ferguson ', 'color: #7dd3fc; font-size: 11px;');
console.log('%c Share your computational research with the global community ', 'color: #9ca3af; font-size: 10px;');