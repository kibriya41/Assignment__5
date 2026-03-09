let allIssues = [];
let currentFilter = "All";

// --- LOGIN  ---
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "admin123") {
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("main-page").classList.remove("hidden");
    fetchIssues();
  } else {
    alert("Invalid Credentials! Use admin / admin123");
  }
});

// ---  DATA FETCHING ---
async function fetchIssues() {
  toggleLoader(true);
  try {
    const response = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
    const data = await response.json();
    allIssues = Array.isArray(data) ? data : data.data || [];
    renderIssues(allIssues);
  } catch (error) {
    console.error("Fetch Error:", error);
    document.getElementById("issues-grid").innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load data.</p>`;
  } finally {
    toggleLoader(false);
  }
}


function getLabelsHtml(labels, isModal = false) {
  if (!labels || labels.length === 0) return "";

  return labels.map(label => {
    let colorClass = "border-slate-100 bg-slate-50 text-slate-500";
    let icon = isModal ? '<i class="fas fa-tag mr-1 text-[10px]"></i>' : "";
    const name = label.toLowerCase();

    if (name.includes('bug')) {
      colorClass = "border-red-100 bg-red-50 text-red-500";
      if (isModal) icon = '<i class="far fa-frown mr-1 text-[12px]"></i>';
    } else if (name.includes('help') || name.includes('enhancement')) {
      colorClass = "border-orange-100 bg-orange-50 text-orange-400";
      if (isModal) icon = '<i class="fas fa-bullseye mr-1 text-[12px]"></i>';
    } else if (name.includes('doc')) {
      colorClass = "border-purple-100 bg-purple-50 text-purple-400";
      if (isModal) icon = '<i class="fas fa-book mr-1 text-[12px]"></i>';
    }

    const sizeClass = isModal ? "text-[10px] px-3 py-1" : "text-[9px] px-2 py-0.5";

    return `
      <span class="border ${colorClass} ${sizeClass} rounded-full uppercase font-bold flex items-center">
        ${icon}${label}
      </span>`;
  }).join('');
}

// ---  CARD RENDERER ---
function renderIssues(issues) {
  const grid = document.getElementById("issues-grid");
  const countEl = document.getElementById("issue-count");
  const dataToProcess = issues || [];

  grid.innerHTML = "";

  const filtered = currentFilter === "All"
    ? dataToProcess
    : dataToProcess.filter(i => i.status?.toLowerCase() === currentFilter.toLowerCase());

  countEl.innerText = filtered.length;

  filtered.forEach((issue) => {
    const status = (issue.status || "open").toLowerCase();
    const isClosed = status === "closed";
    const statusImg = isClosed ? "Closed- Status .png" : "Open-Status.png";
    const borderColor = isClosed ? "border-t-purple-500" : "border-t-green-500";

    const priority = (issue.priority || "LOW").toUpperCase();
    let priorityClass = "bg-slate-100 text-slate-400";
    if (priority === "HIGH") priorityClass = "bg-red-100 text-red-500";
    else if (priority === "MEDIUM") priorityClass = "bg-orange-100 text-orange-500";

    const card = document.createElement("div");
    card.className = `bg-white p-5 rounded-lg border-t-4 ${borderColor} card-shadow cursor-pointer hover:scale-[1.02] transition-transform`;
    card.onclick = () => openIssueDetails(issue.id);

    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
          <div class="w-8 h-8 flex items-center justify-center">
             <img src="${statusImg}" alt="${status}" class="w-full h-full object-contain">
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold ${priorityClass}">${priority}</span>
      </div>
      <h3 class="font-bold text-sm mb-2 line-clamp-1">${issue.title || "Untitled Issue"}</h3>
      <p class="text-[11px] text-gray-500 mb-4 line-clamp-2">${issue.description || "No description provided."}</p>
      
      <div class="flex flex-wrap gap-1 mb-4">
          ${getLabelsHtml(issue.labels)}
      </div>

      <div class="border-t pt-3 flex flex-col gap-1">
          <p class="text-[10px] text-gray-400">#${issue._id?.slice(-4) || '1'} by ${issue.author || "admin"}</p>
          <p class="text-[10px] text-gray-400">${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "Date unknown"}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---  DYNAMIC MODAL ---
async function openIssueDetails(id) {
  const modal = document.getElementById("issue_modal");
  const content = document.getElementById("modal-content");
  
  modal.showModal();
  content.innerHTML = `<div class="flex justify-center p-10"><span class="loading loading-spinner text-primary"></span></div>`;

  try {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const result = await res.json();
    const item = result.data ? result.data : result;

    const statusColor = item.status === 'open' ? 'bg-[#00AA63]' : 'bg-purple-600';
    const priority = (item.priority || 'HIGH').toUpperCase();
    const priorityBg = priority === 'HIGH' ? 'bg-[#FF4D4D]' : priority === 'MEDIUM' ? 'bg-orange-400' : 'bg-slate-400';
    
    content.innerHTML = `
      <h2 class="text-2xl font-bold text-[#1E293B] mb-2">${item.title || 'Untitled Issue'}</h2>
      
      <div class="flex items-center gap-2 mb-6">
        <span class="${statusColor} text-white text-[12px] px-3 py-0.5 rounded-full capitalize font-medium">
          ${item.status || 'Opened'}
        </span>
        <span class="text-gray-400 text-[13px]">•</span>
        <p class="text-gray-500 text-[13px]">
          Opened by <span class="font-semibold text-gray-700">${item.author || 'Admin'}</span> • 
          ${item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'Unknown'}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 mb-6">
        ${getLabelsHtml(item.labels, true) || '<span class="text-gray-300 text-xs">No labels</span>'}
      </div>

      <div class="mb-8">
        <p class="text-gray-600 leading-relaxed text-[15px]">
          ${item.description || 'No description provided.'}
        </p>
      </div>

      <div class="bg-[#F8FAFC] p-6 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <p class="text-gray-400 text-[14px] mb-1 font-medium">Assignee:</p>
          <p class="text-[#1E293B] font-bold text-[16px]">${item.assignee || item.author || 'Unassigned'}</p>
        </div>
        <div class="text-right">
          <p class="text-gray-400 text-[14px] mb-1 font-medium">Priority:</p>
          <span class="${priorityBg} text-white text-[11px] px-4 py-1 rounded font-bold uppercase">
            ${priority}
          </span>
        </div>
      </div>
    `;
    
    const closeBtn = modal.querySelector('form button.btn');
    if (closeBtn) {
        closeBtn.className = "btn bg-[#581CFF] hover:bg-[#4715d4] text-white border-none px-8 rounded-lg";
        closeBtn.innerText = "Close";
    }

  } catch (err) {
    content.innerHTML = `<p class="text-red-500 text-center">Failed to load issue details.</p>`;
  }
}

// --- UTILITIES ---
function filterIssues(type) {
  currentFilter = type;
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("tab-active-custom"));
  const activeBtn = document.getElementById(`tab-${type}`);
  if(activeBtn) activeBtn.classList.add("tab-active-custom");
  renderIssues(allIssues);
}

function toggleLoader(show) {
  const loader = document.getElementById("loader");
  const grid = document.getElementById("issues-grid");
  if (loader) loader.classList.toggle("hidden", !show);
  if (grid) grid.classList.toggle("hidden", show);
}

document.getElementById("search-input").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allIssues.filter(i => 
    i.title.toLowerCase().includes(query) || 
    i.description.toLowerCase().includes(query)
  );
  renderIssues(filtered);
});