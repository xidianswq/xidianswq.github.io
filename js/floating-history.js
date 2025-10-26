/* global CONFIG */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 浮动窗口的那年今日功能
  class FloatingHistory {
    constructor() {
      this.isVisible = false;
      this.currentDate = new Date();
      this.searchRange = 5; // 默认搜寻范围为5天
      this.init();
    }

    init() {
      this.createFloatingWindow();
      this.loadHistoryData();
      this.bindEvents();
    }

    createFloatingWindow() {
      // 创建浮动窗口容器
      const floatingWindow = document.createElement('div');
      floatingWindow.id = 'floating-history-window';
      floatingWindow.className = 'floating-history-window';
      floatingWindow.innerHTML = `
        <div class="floating-history-header">
          <span class="floating-history-title">
            <i class="fas fa-clock fa-spin"></i>
            那年今日
          </span>
          <button class="floating-history-close" id="floating-history-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="floating-history-settings">
          <div class="floating-history-range-control">
            <label for="search-range-slider">搜寻范围: <span id="range-value">5</span>天</label>
            <input type="range" id="search-range-slider" min="0" max="10" value="5" class="range-slider">
          </div>
        </div>
        <div class="floating-history-content" id="floating-history-content">
          <div class="floating-history-loading">
            <i class="fas fa-spinner fa-spin"></i>
            加载中...
          </div>
        </div>
      `;

      // 创建触发按钮
      const triggerButton = document.createElement('div');
      triggerButton.id = 'floating-history-trigger';
      triggerButton.className = 'floating-history-trigger';
      triggerButton.innerHTML = `
        <i class="fas fa-history"></i>
        <span>那年今日</span>
      `;

      // 添加到页面
      document.body.appendChild(floatingWindow);
      document.body.appendChild(triggerButton);

      // 添加样式
      this.addStyles();
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .floating-history-trigger {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #00b8a9;
          color: white;
          padding: 12px 16px;
          border-radius: 25px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
          z-index: 9999;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .floating-history-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 184, 169, 0.4);
        }

        .floating-history-window {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 400px;
          max-height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          display: none;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .floating-history-window.show {
          display: block;
          animation: floatingHistoryFadeIn 0.3s ease;
        }

        @keyframes floatingHistoryFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .floating-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .floating-history-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .floating-history-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .floating-history-close:hover {
          background: #e0e0e0;
          color: #333;
        }

        .floating-history-settings {
          padding: 16px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .floating-history-range-control {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .floating-history-range-control label {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .range-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00b8a9;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00b8a9;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .floating-history-content {
          padding: 20px;
          max-height: 350px;
          overflow-y: auto;
        }

        .floating-history-loading {
          text-align: center;
          color: #666;
          padding: 20px;
        }

        .floating-history-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .floating-history-item:last-child {
          border-bottom: none;
        }

        .floating-history-item:hover {
          background: #f8f9fa;
          border-radius: 6px;
          padding-left: 8px;
          padding-right: 8px;
          margin: 0 -8px;
        }

        .floating-history-date {
          background: #00b8a9;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-right: 12px;
          min-width: 60px;
          text-align: center;
        }

        .floating-history-link {
          flex: 1;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          line-height: 1.4;
        }

        .floating-history-link:hover {
          color: #00b8a9;
        }

        .floating-history-empty {
          text-align: center;
          color: #666;
          padding: 40px 20px;
        }

        .floating-history-empty i {
          font-size: 48px;
          color: #ddd;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .floating-history-window {
            width: 90%;
            max-width: 400px;
            bottom: 70px;
            right: 15px;
          }
          
          .floating-history-trigger {
            bottom: 15px;
            right: 15px;
            padding: 10px 14px;
            font-size: 13px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // 触发按钮点击事件
      const trigger = document.getElementById('floating-history-trigger');
      const closeBtn = document.getElementById('floating-history-close');
      const window = document.getElementById('floating-history-window');
      const rangeSlider = document.getElementById('search-range-slider');
      const rangeValue = document.getElementById('range-value');

      trigger.addEventListener('click', () => {
        this.show();
      });

      closeBtn.addEventListener('click', () => {
        this.hide();
      });

      // 滑动条事件
      rangeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.searchRange = value;
        rangeValue.textContent = value;
        
        // 重新加载数据
        this.loadHistoryData();
      });

      // 点击窗口外部关闭
      window.addEventListener('click', (e) => {
        if (e.target === window) {
          this.hide();
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.hide();
        }
      });
    }

    show() {
      const window = document.getElementById('floating-history-window');
      window.classList.add('show');
      this.isVisible = true;
    }

    hide() {
      const window = document.getElementById('floating-history-window');
      window.classList.remove('show');
      this.isVisible = false;
    }

    async loadHistoryData() {
      try {
        // 获取所有文章数据
        const posts = await this.getPostsData();
        const todayPosts = this.filterPostsByDate(posts);
        this.renderHistoryContent(todayPosts);
      } catch (error) {
        console.error('加载那年今日数据失败:', error);
        this.renderError();
      }
    }

    async getPostsData() {
      try {
        // 从生成的数据文件中获取文章数据
        const response = await fetch('/floating-history-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch posts data');
        }
        const posts = await response.json();
        return posts;
      } catch (error) {
        console.error('获取文章数据失败:', error);
        // 如果获取失败，返回空数组
        return [];
      }
    }

    filterPostsByDate(posts) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      return posts.filter(post => {
        const postDate = new Date(post.date);
        const postMonth = postDate.getMonth() + 1;
        const postDay = postDate.getDate();
        
        // 匹配相同月日的文章（使用动态搜寻范围）
        const dayDiff = Math.abs((postMonth * 30 + postDay) - (month * 30 + day));
        return dayDiff <= this.searchRange;
      }).sort((a, b) => {
        // 按年份排序，越近的年份越靠前
        return b.year - a.year;
      });
    }

    renderHistoryContent(posts) {
      const content = document.getElementById('floating-history-content');
      
      if (posts.length === 0) {
        content.innerHTML = `
          <div class="floating-history-empty">
            <i class="fas fa-calendar-times"></i>
            <p>今天没有历史文章</p>
            <p style="font-size: 12px; color: #999;">前后${this.searchRange}天内都没有找到相关文章</p>
          </div>
        `;
        return;
      }

      const postsHtml = posts.map(post => {
        const postDate = new Date(post.date);
        const year = postDate.getFullYear();
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const day = String(postDate.getDate()).padStart(2, '0');
        
        return `
          <div class="floating-history-item">
            <div class="floating-history-date">${month}-${day}</div>
            <a href="${post.url}" class="floating-history-link" target="_blank">
              ${post.title}
              <span style="color: #999; font-size: 12px;">(${year}年)</span>
            </a>
          </div>
        `;
      }).join('');

      content.innerHTML = postsHtml;
    }

    renderError() {
      const content = document.getElementById('floating-history-content');
      content.innerHTML = `
        <div class="floating-history-empty">
          <i class="fas fa-exclamation-triangle"></i>
          <p>加载失败</p>
          <p style="font-size: 12px; color: #999;">请稍后重试</p>
        </div>
      `;
    }
  }

  // 初始化浮动窗口
  new FloatingHistory();
}); 