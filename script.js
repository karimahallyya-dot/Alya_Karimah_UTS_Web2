// ==========================================
// DATA GLOBAL & SESI
// ==========================================
const products = [
    { id: 1, name: "Kaos Sablon DTF Custom", price: 85000, image: "images/kaos.jpg", description: "Bahan katun 30s, sablon DTF awet dan tajam." },
    { id: 2, name: "Kabel Rem Depan Astrea", price: 35000, image: "images/sweeter.jpg", description: "Part ori untuk motor kesayangan." },
    { id: 3, name: "Jaket Hoodie Polos", price: 120000, image: "images/jaket.jpg", description: "Bahan fleece tebal, cocok untuk sablon." },
    { id: 4, name: "Topi Baseball Polos", price: 25000, image: "images/kemeja.jpg", description: "Warna solid, bahan kanvas rafel." }
];

const sessionInfo = localStorage.getItem('session_uts');

// Fungsi Global untuk Update Navbar
function updateNavbarGlobal() {
    if (sessionInfo && document.getElementById('userGreeting')) {
        document.getElementById('userGreeting').innerText = "Halo, " + sessionInfo.split('@')[0];
        document.getElementById('userGreeting').classList.remove('hidden');
        if(document.getElementById('btnLogin')) document.getElementById('btnLogin').classList.add('hidden');
        if(document.getElementById('btnLogout')) document.getElementById('btnLogout').classList.remove('hidden');
    }
    const cart = JSON.parse(localStorage.getItem('cart_uts')) || [];
    if(document.getElementById('cart-count')) {
        document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }
}

window.logout = function() {
    localStorage.removeItem('session_uts');
    window.location.href = 'index.html';
}

// ==========================================
// 1. LOGIKA HALAMAN LOGIN
// ==========================================
if (document.getElementById('authSection')) {
    if (sessionInfo) window.location.href = 'index.html'; // Tolak akses jika sudah login

    let isLoginMode = true;
    window.switchAuthMode = function() {
        isLoginMode = !isLoginMode;
        document.getElementById('authTitle').innerText = isLoginMode ? "Login Akun" : "Daftar Akun Baru";
        document.getElementById('btnSubmitAuth').innerText = isLoginMode ? "Masuk" : "Daftar Sekarang";
        document.querySelector('#authSection p span').innerText = isLoginMode ? "Daftar di sini" : "Login di sini";
        document.querySelector('#authSection p').childNodes[0].nodeValue = isLoginMode ? "Belum punya akun? " : "Sudah punya akun? ";
    }

    window.prosesAuth = function() {
        const email = document.getElementById('emailAuth').value;
        const pass = document.getElementById('passAuth').value;
        if(!email || pass.length < 6) return alert("Email wajib diisi dan Password minimal 6 karakter!");

        let users = JSON.parse(localStorage.getItem('users_uts')) || [];
        if(!isLoginMode) {
            if(users.find(u => u.email === email)) return alert("Email sudah terdaftar!");
            users.push({ email, pass });
            localStorage.setItem('users_uts', JSON.stringify(users));
            alert("Daftar sukses! Silakan login.");
            switchAuthMode();
        } else {
            if(!users.find(u => u.email === email && u.pass === pass)) return alert("Data salah!");
            localStorage.setItem('session_uts', email);
            window.location.href = 'index.html'; 
        }
    }
}

// ==========================================
// 2. LOGIKA HALAMAN UTAMA (INDEX)
// ==========================================
if (document.getElementById('index-page')) {
    updateNavbarGlobal();
    tampilkanProduk(products);
    renderHistory();

    function tampilkanProduk(dataProduk) {
        const list = document.getElementById('product-list');
        list.innerHTML = '';
        dataProduk.forEach(p => {
            list.innerHTML += `
                <div class="bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col border overflow-hidden">
                    <img src="${p.image}" class="w-full h-48 object-cover">
                    <div class="p-5 flex flex-col flex-grow">
                        <h3 class="font-bold mb-2">${p.name}</h3>
                        <div class="flex justify-between mt-auto items-center">
                            <span class="text-indigo-600 font-bold">Rp ${p.price.toLocaleString('id-ID')}</span>
                            <button onclick="tambahKeKeranjang(${p.id})" class="bg-indigo-100 text-indigo-700 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition">
                                Tambah
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    }

    window.cariProduk = function() {
        const keyword = document.getElementById('searchInput').value.toLowerCase();
        tampilkanProduk(products.filter(p => p.name.toLowerCase().includes(keyword)));
    }

    window.tambahKeKeranjang = function(id) {
        if (!sessionInfo) return window.location.href = 'login.html'; // Arahkan ke login jika belum
        
        let cart = JSON.parse(localStorage.getItem('cart_uts')) || [];
        const produk = products.find(p => p.id === id);
        const existing = cart.find(i => i.id === id);
        
        if(existing) existing.qty += 1;
        else cart.push({ ...produk, qty: 1 });
        
        localStorage.setItem('cart_uts', JSON.stringify(cart));
        updateNavbarGlobal();
        alert(produk.name + " masuk keranjang!");
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('history_uts')) || [];
        const list = document.getElementById('history-list');
        const userHistory = history.filter(h => h.user === sessionInfo);
        
        if(!sessionInfo || userHistory.length === 0) return list.innerHTML = '<p class="text-gray-400 italic">Belum ada riwayat transaksi.</p>';
        list.innerHTML = userHistory.map(h => `
            <div class="border rounded p-4 mb-3 flex justify-between bg-gray-50">
                <div><p class="font-bold">${h.id}</p><p class="text-sm">Penerima: ${h.nama}</p></div>
                <div class="text-right"><p class="text-amber-500 font-bold">${h.total}</p></div>
            </div>`).join('');
    }
}

// ==========================================
// 3. LOGIKA HALAMAN KERANJANG (CART)
// ==========================================
if (document.getElementById('cart-page')) {
    if (!sessionInfo) window.location.href = 'login.html'; // Keamanan Halaman
    updateNavbarGlobal();
    renderCartDetail();

    window.updateQtyDetail = function(id, change) {
        let cart = JSON.parse(localStorage.getItem('cart_uts')) || [];
        const item = cart.find(i => i.id === id);
        if(item) {
            item.qty += change;
            if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
            localStorage.setItem('cart_uts', JSON.stringify(cart));
            renderCartDetail();
        }
    }

    function renderCartDetail() {
        const cart = JSON.parse(localStorage.getItem('cart_uts')) || [];
        const container = document.getElementById('cart-items-detail');
        let total = 0;

        if(cart.length === 0) {
            container.innerHTML = '<p class="text-center py-10 text-gray-500">Keranjang masih kosong.</p>';
            document.getElementById('cart-total-detail').innerText = "Rp 0";
            document.getElementById('btnToCheckout').classList.add('opacity-50', 'pointer-events-none');
            return;
        }

        document.getElementById('btnToCheckout').classList.remove('opacity-50', 'pointer-events-none');
        container.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            return `
                <div class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                    <div class="w-1/2">
                        <p class="font-bold text-lg line-clamp-1">${item.name}</p>
                        <p class="text-indigo-600">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="flex items-center gap-3 bg-white border rounded-lg px-3 py-1">
                        <button onclick="updateQtyDetail(${item.id}, -1)" class="text-xl text-red-500 font-bold px-2 hover:bg-gray-100 rounded">-</button>
                        <span class="font-bold w-6 text-center">${item.qty}</span>
                        <button onclick="updateQtyDetail(${item.id}, 1)" class="text-xl text-green-500 font-bold px-2 hover:bg-gray-100 rounded">+</button>
                    </div>
                </div>`;
        }).join('');
        document.getElementById('cart-total-detail').innerText = "Rp " + total.toLocaleString('id-ID');
    }
}

// ==========================================
// 4. LOGIKA HALAMAN CHECKOUT
// ==========================================
if (document.getElementById('checkout-page')) {
    if (!sessionInfo) window.location.href = 'login.html'; // Keamanan Halaman
    
    const cart = JSON.parse(localStorage.getItem('cart_uts')) || [];
    if (cart.length === 0) window.location.href = 'index.html'; // Tolak jika keranjang kosong

    // Tampilkan Total Pembayaran
    const totalSemua = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalTeks = "Rp " + totalSemua.toLocaleString('id-ID');
    document.getElementById('checkout-total-display').innerText = totalTeks;

    window.prosesCheckoutFinal = function() {
        const nama = document.getElementById('nama').value;
        const nohp = document.getElementById('nohp').value;
        const alamat = document.getElementById('alamat').value;

        if(!nama || !nohp || !alamat) return alert("Mohon lengkapi semua data formulir!");

        const idTrx = "TRX-" + Math.floor(Math.random() * 900000 + 100000);
        const orderData = { id: idTrx, user: sessionInfo, nama, nohp, alamat, total: totalTeks, tanggal: new Date().toLocaleString() };

        let history = JSON.parse(localStorage.getItem('history_uts')) || [];
        history.unshift(orderData);
        localStorage.setItem('history_uts', JSON.stringify(history));
        
        localStorage.removeItem('cart_uts'); // Kosongkan keranjang
        
        alert("Sukses! Pesanan " + idTrx + " berhasil dibuat. Anda akan dialihkan ke halaman utama.");
        window.location.href = 'index.html'; // Alihkan kembali ke toko
    }
}
