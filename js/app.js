// js/app.js - Deep Space Academy LMS (PWA + Responsive)

let currentUser = null;
let currentBook = null;
let currentChapterIndex = 0;
let fontSize = 18;

// ==================== მომხმარებლები ====================
const users = [
  { 
    id: 1, 
    email: "student@lms.ge", 
    password: "student123", 
    role: "student", 
    username: "სტუდენტი" 
  },
  { 
    id: 2, 
    email: "admin@lms.ge", 
    password: "admin123", 
    role: "admin", 
    username: "ადმინისტრატორი" 
  },
  { 
    id: 3, 
    email: "teacher@lms.ge", 
    password: "teacher123", 
    role: "teacher", 
    username: "მასწავლებელი" 
  }
];

// ==================== წიგნების მონაცემთა ბაზა ====================
const booksDatabase = [
  {
    id: 1,
    title: "ვეფხისტყაოსანი",
    author: "შოთა რუსთაველი",
    genre: "პოეზია",
    cover: "https://via.placeholder.com/300x420/1a1a2e/64b5ff?text=ვეფხისტყაოსანი",
    chapters: [
      { title: "დასაწყისი", text: "რომელმან შექმნა სამყარო ძალითა მით ძლიერითა..." },
      { title: "როსტევან მეფის ამბავი", text: "იყო არაბეთს როსტევან, მეფე სახელოვანი..." },
      { title: "ტარიელის ამბავი", text: "ტარიელი იყო ვეფხისტყაოსანი..." }
    ]
  },
  {
    id: 2,
    title: "ოთარაანთ ქვრივი",
    author: "ილია ჭავჭავაძე",
    genre: "მხატვრული",
    cover: "https://via.placeholder.com/300x420/1a1a2e/64b5ff?text=ოთარაანთ+ქვრივი",
    chapters: [
      { title: "თავი 1", text: "სოფელში ყველამ იცოდა, ვინ იყო ოთარაანთ ქვრივი..." }
    ]
  },
  {
    id: 3,
    title: "კაცია - ადამიანი?!",
    author: "ილია ჭავჭავაძე",
    genre: "მხატვრული",
    cover: "https://via.placeholder.com/300x420/1a1a2e/64b5ff?text=კაცია+ადამიანი",
    chapters: [
      { title: "შესავალი", text: "ლუარსაბ თათქარიძე — კარგად ჩასუქებული თავადი..." }
    ]
  },
  {
    id: 4,
    title: "ჯაყოს ხიზნები",
    author: "მიხეილ ჯავახიშვილი",
    genre: "მხატვრული",
    cover: "https://via.placeholder.com/300x420/1a1a2e/64b5ff?text=ჯაყოს+ხიზნები",
    chapters: [
      { title: "თავი 1", text: "ჯაყო და მისი თავგადასავალი..." }
    ]
  }
];

// ==================== ლიტერატურის ისტორია ====================
const literatureHistory = [
  {
    period: "ძველი ქართული ლიტერატურა (V-XVIII ს.)",
    description: "სასულიერო და საერო ლიტერატურის ჩამოყალიბება და განვითარება.",
    key_figures: "იაკობ ცურტაველი, შოთა რუსთაველი, სულხან-საბა ორბელიანი",
    works: "ვეფხისტყაოსანი, წამება წმიდისა შუშანიკისი"
  },
  {
    period: "ახალი ქართული ლიტერატურა (XIX ს.)",
    description: "რომანტიზმიდან რეალიზმამდე გადასვლა.",
    key_figures: "ილია ჭავჭავაძე, აკაკი წერეთელი, ვაჟა-ფშაველა",
    works: "ოთარაანთ ქვრივი, კაცია — ადამიანი?!"
  },
  {
    period: "XX საუკუნის ქართული ლიტერატურა",
    description: "მოდერნიზმი, საბჭოთა პერიოდი და თანამედროვე ლიტერატურა.",
    key_figures: "მიხეილ ჯავახიშვილი, კონსტანტინე გამსახურდია",
    works: "ჯაყოს ხიზნები, მთვარის მატარებელი"
  }
];

// ==================== ძირითადი ფუნქციები ====================

function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = (user.role === 'admin' || user.role === 'teacher') ? 'admin.html' : 'dashboard.html';
  } else {
    alert('არასწორი ელფოსტა ან პაროლი!');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'auth.html';
}

// ==================== წიგნების Reader ====================

function openReader(bookId) {
  currentBook = booksDatabase.find(b => b.id === bookId);
  if (!currentBook) return;

  currentChapterIndex = 0;
  document.getElementById('readerModal').style.display = 'flex';
  document.getElementById('readerBookTitle').textContent = currentBook.title;
  
  loadChapter(0);
  renderTOC();
}

function loadChapter(index) {
  if (!currentBook || !currentBook.chapters[index]) return;
  
  currentChapterIndex = index;
  const chapter = currentBook.chapters[index];
  
  document.getElementById('bookText').innerHTML = `
    <h2>${chapter.title}</h2>
    <p>${chapter.text}</p>
  `;

  updateProgress();
  
  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').disabled = index === currentBook.chapters.length - 1;
}

function renderTOC() {
  const list = document.getElementById('tocList');
  list.innerHTML = '';
  
  currentBook.chapters.forEach((ch, i) => {
    const li = document.createElement('li');
    li.textContent = ch.title;
    li.style.padding = "10px 8px";
    li.style.cursor = "pointer";
    li.style.borderRadius = "8px";
    li.onclick = () => loadChapter(i);
    if (i === currentChapterIndex) li.style.background = "rgba(100,150,255,0.2)";
    list.appendChild(li);
  });
}

function updateProgress() {
  const progress = currentBook.chapters.length > 0 
    ? Math.round(((currentChapterIndex + 1) / currentBook.chapters.length) * 100) 
    : 0;
  
  document.getElementById('progressBar').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `${progress}%`;
}

function nextChapter() {
  if (currentChapterIndex < currentBook.chapters.length - 1) {
    loadChapter(currentChapterIndex + 1);
  }
}

function prevChapter() {
  if (currentChapterIndex > 0) {
    loadChapter(currentChapterIndex - 1);
  }
}

function changeFontSize(delta) {
  fontSize = Math.max(14, Math.min(28, fontSize + delta));
  document.getElementById('bookText').style.fontSize = `${fontSize}px`;
}

function toggleFullscreen() {
  const modal = document.getElementById('readerModal');
  if (!document.fullscreenElement) {
    modal.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function closeReader() {
  document.getElementById('readerModal').style.display = 'none';
}

// ==================== მობილური მენიუ ====================
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

// ==================== PWA Service Worker ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('✅ Service Worker წარმატებით დარეგისტრირდა');
      })
      .catch(err => {
        console.log('❌ Service Worker შეცდომა:', err);
      });
  });
}

// გლობალური ფუნქციები (HTML-დან გამოძახებისთვის)
window.login = login;
window.logout = logout;
window.openReader = openReader;
window.nextChapter = nextChapter;
window.prevChapter = prevChapter;
window.changeFontSize = changeFontSize;
window.toggleFullscreen = toggleFullscreen;
window.closeReader = closeReader;
window.toggleMobileMenu = toggleMobileMenu;
