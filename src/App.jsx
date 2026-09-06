import React, { useState } from 'react';

/* ─── Sidebar Component ─── */
function Sidebar({ open, onToggle }) {
  return (
    <aside
      className={`w-[240px] shrink-0 bg-[#f7f7f5] border-r border-[#e9e9e7] flex flex-col justify-between select-none fixed md:relative h-screen z-40 transition-transform duration-200 ${
        open ? '' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-3">
        {/* Workspace Switcher */}
        <div className="flex items-center justify-between p-1.5 rounded hover:bg-[rgba(55,53,47,0.08)] cursor-pointer text-[#37352f] text-[14px] font-semibold mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-5 h-5 rounded bg-[#37352f] text-white flex items-center justify-center text-[11px] font-bold">S</div>
            <span className="truncate">Saikiran's Workspace</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">unfold_more</span>
        </div>

        {/* Quick Actions */}
        <div className="space-y-0.5 text-[13px] text-[#37352f]">
          <button className="w-full flex items-center gap-2.5 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-left">
            <span className="material-symbols-outlined text-[17px] text-[rgba(55,53,47,0.45)]">search</span>
            <span>Search</span>
            <span className="ml-auto text-[10px] text-[rgba(55,53,47,0.45)] font-mono bg-white border border-[#e9e9e7] px-1 rounded">⌘K</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-left">
            <span className="material-symbols-outlined text-[17px] text-[rgba(55,53,47,0.45)]">update</span>
            <span>Updates</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-left">
            <span className="material-symbols-outlined text-[17px] text-[rgba(55,53,47,0.45)]">settings</span>
            <span>Settings &amp; members</span>
          </button>
        </div>

        {/* Workspace Pages */}
        <div className="mt-5">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)]">Workspace Pages</div>
          <nav className="mt-1 space-y-0.5 text-[13px] text-[#37352f]">
            <a className="flex items-center gap-2 px-2 py-1 rounded bg-[rgba(55,53,47,0.06)] font-medium text-[#37352f]" href="#about">
              <span>🎓</span><span className="truncate">Developer Portfolio</span>
            </a>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#projects">
              <span>🗂️</span><span className="truncate">Projects Gallery</span>
            </a>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#experience">
              <span>🛠️</span><span className="truncate">Engineering Experience</span>
            </a>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#skills">
              <span>🛠️</span><span className="truncate">Technical Skills</span>
            </a>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#education">
              <span>🎓</span><span className="truncate">Education</span>
            </a>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#contact">
              <span>📬</span><span className="truncate">Get In Touch</span>
            </a>
          </nav>
        </div>

        {/* Recruiter Fast-Track */}
        <div className="mt-6">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)]">Recruiter Fast-Track</div>
          <div className="mt-1 space-y-0.5 text-[13px]">
            <a className="flex items-center justify-between px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#contact">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">code</span>
                <span>GitHub Profile</span>
              </span>
              <span className="material-symbols-outlined text-[13px] text-[rgba(55,53,47,0.45)]">open_in_new</span>
            </a>
            <a className="flex items-center justify-between px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#contact">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">account_circle</span>
                <span>LinkedIn</span>
              </span>
              <span className="material-symbols-outlined text-[13px] text-[rgba(55,53,47,0.45)]">open_in_new</span>
            </a>
            <a className="flex items-center justify-between px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] hover:text-[#37352f]" href="#contact">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">description</span>
                <span>Resume (PDF)</span>
              </span>
              <span className="text-[10px] bg-[#dbeddb] text-[#286644] px-1.5 py-0.5 rounded font-medium">Updated</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="p-3 border-t border-[#e9e9e7]">
        <div className="flex items-center gap-2.5 p-1 rounded hover:bg-[rgba(55,53,47,0.08)] cursor-pointer">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#e9e9e7] bg-white flex items-center justify-center text-[11px] font-bold text-[#37352f]">
            S
          </div>
          <div className="text-[12px] truncate">
            <div className="font-medium text-[#37352f] leading-none">Saikiran Chevula</div>
            <div className="text-[10px] text-[rgba(55,53,47,0.45)] mt-0.5">[Add Professional Email]</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Breadcrumb Toolbar */}
        <header className="h-11 border-b border-[#e9e9e7] sticky top-0 bg-white/95 backdrop-blur z-30 px-4 flex items-center justify-between text-[13px] text-[#37352f]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <button className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.65)] md:hidden mr-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-symbols-outlined text-[18px]">menu</span>
            </button>
            <span className="text-[rgba(55,53,47,0.65)] hover:underline cursor-pointer truncate">Saikiran's Workspace</span>
            <span className="text-[rgba(55,53,47,0.45)]">/</span>
            <span className="flex items-center gap-1 font-medium truncate">
              <span>🎓</span>
              <span>Developer Portfolio</span>
            </span>
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#dbeddb] text-[#286644]">
              🟢 Available for Opportunities
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-[rgba(55,53,47,0.65)]">
            <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1 text-[12px]">Share</button>
            <button className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)]" title="Favorite">
              <span className="material-symbols-outlined text-[18px]">star_border</span>
            </button>
            <button className="p-1 rounded hover:bg-[rgba(55,53,47,0.08)]" title="More">
              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            </button>
          </div>
        </header>

        {/* Scrollable Document */}
        <main className="w-full overflow-y-auto pb-28">
          
          {/* COVER PHOTO */}
          <div className="relative w-full h-[220px] md:h-[260px] group bg-[#f7f7f5] overflow-hidden">
            <img 
              src="/banner.png" 
              alt="Portfolio cover — abstract watercolor shapes" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <button className="px-2.5 py-1 bg-white/90 backdrop-blur rounded text-[12px] text-[#37352f] shadow-sm hover:bg-white flex items-center gap-1 border border-[#e9e9e7]">
                <span className="material-symbols-outlined text-[14px]">image</span>
                <span>Change cover</span>
              </button>
            </div>
          </div>

          {/* DOCUMENT CONTAINER */}
          <div className="max-w-[920px] mx-auto px-6 sm:px-12">
            
            {/* AVATAR (overlapping cover) */}
            <div className="relative -mt-16 sm:-mt-20 mb-4 inline-block group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-1 shadow-md border border-[#e9e9e7] overflow-hidden cursor-pointer flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#f7f7f5] flex items-center justify-center text-[40px] font-bold text-[#37352f]">
                  S
                </div>
              </div>
              <div className="absolute -bottom-2 right-1 bg-white shadow-sm border border-[#e9e9e7] rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer" title="Change icon">
                <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.65)]">mood</span>
              </div>
            </div>

            {/* Page Actions */}
            <div className="flex items-center gap-3 text-[12px] text-[rgba(55,53,47,0.45)] mb-2 select-none opacity-80 hover:opacity-100">
              <button className="hover:text-[#37352f] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add_comment</span>
                <span>Add comment</span>
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                <span>Edited just now</span>
              </span>
            </div>

            {/* PAGE TITLE */}
            <h1 className="text-[34px] sm:text-[40px] font-bold text-[#37352f] tracking-tight leading-tight mb-1">
              Saikiran Chevula 🎓
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[rgba(55,53,47,0.65)] mb-6">
              Software Developer | Backend &amp; Full-Stack • Seeking Entry-Level / Full-Time SWE
            </p>

            {/* DATABASE PROPERTIES BLOCK */}
            <div className="border-y border-[#e9e9e7] py-3.5 my-6 space-y-2 text-[14px]">
              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center py-1">
                <div className="w-36 text-[rgba(55,53,47,0.45)] flex items-center gap-2 text-[13px]">
                  <span className="material-symbols-outlined text-[16px]">label</span><span>Status</span>
                </div>
                <div className="mt-1 sm:mt-0 flex items-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#dbeddb] text-[#286644] border border-[#c3e2c3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#286644] animate-pulse"></span>
                    Open to Entry-Level / Full-Time Software Development Roles
                  </span>
                </div>
              </div>
              {/* Education */}
              <div className="flex flex-col sm:flex-row sm:items-center py-1">
                <div className="w-36 text-[rgba(55,53,47,0.45)] flex items-center gap-2 text-[13px]">
                  <span className="material-symbols-outlined text-[16px]">school</span><span>Education</span>
                </div>
                <div className="mt-1 sm:mt-0 text-[#37352f] font-medium flex items-center gap-1.5">
                  <span>[Degree Name], [College / University Name]</span>
                  <span className="text-[rgba(55,53,47,0.45)] text-[13px] font-normal">• [Start Year] – [Graduation Year]</span>
                </div>
              </div>
              {/* Location */}
              <div className="flex flex-col sm:flex-row sm:items-center py-1">
                <div className="w-36 text-[rgba(55,53,47,0.45)] flex items-center gap-2 text-[13px]">
                  <span className="material-symbols-outlined text-[16px]">location_on</span><span>Location</span>
                </div>
                <div className="mt-1 sm:mt-0 text-[#37352f]">India</div>
              </div>
              {/* Links */}
              <div className="flex flex-col sm:flex-row sm:items-center py-1">
                <div className="w-36 text-[rgba(55,53,47,0.45)] flex items-center gap-2 text-[13px]">
                  <span className="material-symbols-outlined text-[16px]">link</span><span>Quick Links</span>
                </div>
                <div className="mt-1 sm:mt-0 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1 text-[#37352f] bg-[#f7f7f5] px-2 py-0.5 rounded border border-[#e9e9e7] italic text-[rgba(55,53,47,0.45)]">
                    GitHub <span className="text-[11px]">[Add URL]</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#37352f] bg-[#f7f7f5] px-2 py-0.5 rounded border border-[#e9e9e7] italic text-[rgba(55,53,47,0.45)]">
                    LinkedIn <span className="text-[11px]">[Add URL]</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#286644] bg-[#dbeddb] px-2 py-0.5 rounded font-medium italic">
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Resume.pdf <span className="text-[11px] font-normal">[Add Link]</span>
                  </span>
                </div>
              </div>
              {/* Availability */}
              <div className="flex flex-col sm:flex-row sm:items-center py-1">
                <div className="w-36 text-[rgba(55,53,47,0.45)] flex items-center gap-2 text-[13px]">
                  <span className="material-symbols-outlined text-[16px]">schedule</span><span>Availability</span>
                </div>
                <div className="mt-1 sm:mt-0 text-[#37352f] font-medium">Immediate / Open to Full-Time Opportunities</div>
              </div>
            </div>

            {/* YELLOW CALLOUT: INTRO */}
            <div className="rounded-md bg-[#fbf3db] border border-[#f1e5bc] p-4 flex items-start gap-3 my-7 text-[#37352f]" id="about">
              <div className="text-[20px] select-none shrink-0 mt-0.5">💡</div>
              <div className="text-[14px] leading-relaxed">
                <span className="font-semibold">👋 Hey there, I'm Saikiran!</span> I'm a software developer focused on building practical backend and full-stack applications. I enjoy working with <strong className="font-semibold">Java, Spring Boot, REST APIs, databases, and microservices</strong>, while continuously improving my problem-solving and software engineering skills. I'm currently looking for entry-level software development opportunities where I can learn, contribute, and grow as an engineer.
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── PROJECTS SECTION ───────── */}
            <section className="my-8" id="projects">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">🗂️</span>
                  <h2 className="text-[20px] font-bold text-[#37352f]">Featured Projects &amp; Systems</h2>
                  <span className="text-[12px] bg-[#f1f1ef] text-[rgba(55,53,47,0.45)] px-2 py-0.5 rounded font-mono">1 item</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[rgba(55,53,47,0.65)]">
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">filter_list</span><span>Filter</span>
                  </button>
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">swap_vert</span><span>Sort</span>
                  </button>
                  <button className="px-2 py-1 rounded hover:bg-[rgba(55,53,47,0.08)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">search</span>
                  </button>
                  <button className="px-2.5 py-1 rounded bg-[#2383e2] hover:bg-[#1a70c5] text-white font-medium flex items-center gap-1">
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-4 border-b border-[#e9e9e7] mb-6 text-[13px]">
                <button className="flex items-center gap-1.5 py-2 font-medium text-[#37352f] border-b-2 border-[#37352f] -mb-[1px]">
                  <span className="material-symbols-outlined text-[16px]">grid_view</span><span>Gallery View</span>
                </button>
                <button className="flex items-center gap-1.5 py-2 text-[rgba(55,53,47,0.45)] hover:text-[#37352f]">
                  <span className="material-symbols-outlined text-[16px]">table_rows</span><span>Table</span>
                </button>
                <button className="flex items-center gap-1.5 py-2 text-[rgba(55,53,47,0.45)] hover:text-[#37352f]">
                  <span className="material-symbols-outlined text-[16px]">view_kanban</span><span>Board</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* CARD 1: Inventory Management System */}
                <div className="group rounded-lg border border-[#e9e9e7] bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#d0d0cc] transition-all overflow-hidden flex flex-col cursor-pointer">
                  <div className="h-40 bg-[#f7f7f5] overflow-hidden relative border-b border-[#e9e9e7] flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[48px] text-[rgba(55,53,47,0.25)]">inventory_2</span>
                      <div className="text-[12px] text-[rgba(55,53,47,0.45)] mt-1 font-mono">Microservices Architecture</div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[11px] font-mono text-[#37352f] shadow-sm border border-[#e9e9e7]">
                        🔧 Backend
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[16px]">🏗️</span>
                        <h3 className="font-bold text-[15px] text-[#37352f] group-hover:text-[#2383e2] transition-colors">
                          Inventory Management System
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fadec9] text-[#854c1d]">Java</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#d3e5ef] text-[#205d86]">Spring Boot</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#dbeddb] text-[#286644]">REST APIs</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e8deee] text-[#5c3882]">PostgreSQL</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e3e2e0] text-[#32302c]">Docker</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fdecc8] text-[#8f632d]">Kong API GW</span>
                      </div>
                      <p className="text-[13px] text-[rgba(55,53,47,0.65)] leading-relaxed mb-3">
                        A microservices-based inventory management system designed to manage products, inventory, and business operations through secure REST APIs. Features authentication, authorization, and Dockerized services.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#f1f1ef] flex items-center justify-between text-[12px]">
                      <span className="font-mono text-[rgba(55,53,47,0.45)] text-[11px]">Java · Spring Boot · PostgreSQL</span>
                      <div className="flex items-center gap-2 text-[rgba(55,53,47,0.65)] italic">
                        <span className="text-[11px]">[Add GitHub ↗]</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Placeholder */}
                <div className="group rounded-lg border border-dashed border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-all overflow-hidden flex flex-col cursor-pointer items-center justify-center min-h-[300px] text-center p-6">
                  <span className="material-symbols-outlined text-[36px] text-[rgba(55,53,47,0.2)] mb-3">add_circle_outline</span>
                  <h3 className="font-medium text-[15px] text-[rgba(55,53,47,0.45)] mb-1">Project 2</h3>
                  <p className="text-[13px] text-[rgba(55,53,47,0.35)] max-w-[200px]">
                    [Project details coming soon. Click + New to add.]
                  </p>
                </div>

                {/* CARD 3: Placeholder */}
                <div className="group rounded-lg border border-dashed border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-all overflow-hidden flex flex-col cursor-pointer items-center justify-center min-h-[300px] text-center p-6">
                  <span className="material-symbols-outlined text-[36px] text-[rgba(55,53,47,0.2)] mb-3">add_circle_outline</span>
                  <h3 className="font-medium text-[15px] text-[rgba(55,53,47,0.45)] mb-1">Project 3</h3>
                  <p className="text-[13px] text-[rgba(55,53,47,0.35)] max-w-[200px]">
                    [Project details coming soon. Click + New to add.]
                  </p>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── EXPERIENCE SECTION ───────── */}
            <section className="my-8" id="experience">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🛠️</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Engineering Experience</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">
                Independent Software Development • Backend &amp; Full-Stack Projects
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Backend Development */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#d3e5ef] text-[#205d86]">Backend Development</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Built RESTful APIs using <strong className="text-[#37352f] font-medium">Java</strong> and <strong className="text-[#37352f] font-medium">Spring Boot</strong>.</li>
                      <li>Developed services following a <strong className="text-[#37352f] font-medium">microservices architecture</strong>.</li>
                      <li>Implemented <strong className="text-[#37352f] font-medium">authentication</strong>, authorization, validation, and exception handling.</li>
                    </ul>
                  </div>
                </div>
                {/* System Design */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#e8deee] text-[#5c3882]">System Design</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Designed clear <strong className="text-[#37352f] font-medium">service boundaries</strong>, database schemas, and API contracts.</li>
                      <li>Integrated backend services through an <strong className="text-[#37352f] font-medium">API Gateway</strong>.</li>
                      <li>Used <strong className="text-[#37352f] font-medium">Docker</strong> for containerized development.</li>
                    </ul>
                  </div>
                </div>
                {/* Development Practices */}
                <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-white transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-[#dbeddb] text-[#286644]">Development Practices</span>
                    </div>
                    <ul className="list-disc list-inside text-[13px] text-[rgba(55,53,47,0.65)] space-y-2 leading-relaxed">
                      <li>Used <strong className="text-[#37352f] font-medium">Git and GitHub</strong> for version control.</li>
                      <li>Tested APIs and debugged application and integration issues.</li>
                      <li>Documented project architecture and setup.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── SKILLS SECTION ───────── */}
            <section className="my-8" id="skills">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🛠️</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Technical Skills</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">Core competencies, technologies, and developer tooling.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)] mb-2">Programming Languages</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Java", "JavaScript", "SQL"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)] mb-2">Backend</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Spring Boot", "REST APIs", "Microservices"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)] mb-2">Frontend</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "HTML", "CSS"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)] mb-2">Databases</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["PostgreSQL", "MySQL"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] md:col-span-2">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[rgba(55,53,47,0.45)] mb-2">Tools &amp; Technologies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Git", "GitHub", "Docker", "Kong / API Gateway"].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f1ef] text-[#37352f] border border-[#e9e9e7]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── EDUCATION SECTION ───────── */}
            <section className="my-8" id="education">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[18px]">🎓</span>
                <h2 className="text-[20px] font-bold text-[#37352f]">Education</h2>
              </div>
              <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4">Academic background and foundational coursework.</p>
              <div className="p-4 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#37352f]">[Degree Name]</h3>
                    <div className="text-[13px] text-[rgba(55,53,47,0.65)] font-medium mt-0.5">[College / University Name]</div>
                  </div>
                  <span className="text-[12px] font-mono text-[rgba(55,53,47,0.45)] bg-white border border-[#e9e9e7] px-2 py-0.5 rounded shrink-0">
                    [Start Year] – [Graduation Year]
                  </span>
                </div>
                <div className="pt-3 border-t border-[#e9e9e7]">
                  <div className="text-[12px] font-semibold text-[#37352f] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[rgba(55,53,47,0.45)]">menu_book</span>
                    <span>Relevant Coursework</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Data Structures & Algorithms",
                      "Database Management Systems",
                      "Object-Oriented Programming",
                      "Operating Systems",
                      "Computer Networks"
                    ].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded text-[12px] font-medium bg-white text-[#37352f] border border-[#e9e9e7]">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-b border-[#e9e9e7] my-8"></div>

            {/* ───────── CONTACT SECTION (Blue Callout) ───────── */}
            <section className="my-8" id="contact">
              <div className="rounded-lg bg-[#edf3f8] border border-[#dbe8f2] p-5 text-[#37352f]">
                <div className="flex items-start gap-3">
                  <div className="text-[22px] select-none mt-0.5">📬</div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-[#205d86] mb-1">
                      Let's connect! I'm actively looking for full-time developer roles
                    </h3>
                    <p className="text-[13px] text-[rgba(55,53,47,0.65)] mb-4 leading-relaxed">
                      Looking for a dedicated software developer who builds reliable backend systems with Java &amp; Spring Boot? I'd love to chat about entry-level software development opportunities.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        className="px-3 py-1.5 bg-white border border-[#dbe8f2] rounded shadow-sm hover:bg-[#f7f7f5] text-[13px] font-medium text-[#37352f] flex items-center gap-2 transition-colors"
                        onClick={showToast}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[rgba(55,53,47,0.45)]">content_copy</span>
                        <span>Copy Email: [Add Email]</span>
                      </button>
                      <a className="px-3 py-1.5 bg-[#2383e2] hover:bg-[#1a70c5] text-white rounded text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm" href="#contact">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Send Email Directly</span>
                      </a>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#dbe8f2]/60 flex items-center justify-between text-[12px] text-[rgba(55,53,47,0.65)]" id="resume">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#205d86]">description</span>
                        <span>Saikiran_Chevula_Resume.pdf</span>
                      </div>
                      <span className="font-medium text-[#205d86] italic flex items-center gap-1">
                        [Add Resume Link]
                        <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-16 pt-6 border-t border-[#e9e9e7] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[rgba(55,53,47,0.45)] select-none mb-8">
              <div className="flex items-center gap-2">
                <span>Made with care in Notion style</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} Saikiran Chevula</span>
              </div>
              <div className="flex items-center gap-3">
                <a className="hover:text-[#37352f]" href="#about">Back to Top ↑</a>
                <span>•</span>
                <a className="hover:text-[#37352f] italic" href="#contact">GitHub [Add Link]</a>
                <span>•</span>
                <a className="hover:text-[#37352f] italic" href="#contact">LinkedIn [Add Link]</a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-6 right-6 bg-[#37352f] text-white px-4 py-2 rounded shadow-lg text-[13px] flex items-center gap-2 transition-all duration-200 z-50 ${
        toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}>
        <span className="material-symbols-outlined text-[16px] text-[#dbeddb]">check_circle</span>
        <span>Email copied to clipboard!</span>
      </div>
    </div>
  );
}
