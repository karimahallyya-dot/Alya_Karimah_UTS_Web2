// 1. Kita cari dulu "kotak kosong" di HTML
const productList = document.getElementById('product-list');

// 2. Karena browser memblokir baca file dari luar, kita taruh data dummy JSON-nya langsung di sini
const products = [
  {
    "id": 1,
    "name": "Kaos Sablon DTF Custom",
    "price": 85000,
    "image": "https://via.placeholder.com/300x200?text=Kaos+DTF",
    "description": "Kaos bahan katun dengan sablon DTF desain bebas sesuai keinginan."
  },
  {
    "id": 2,
    "name": "Kabel Rem Depan Astrea",
    "price": 35000,
    "image": "https://via.placeholder.com/300x200?text=Kabel+Rem",
    "description": "Kabel rem dengan kualitas terjamin untuk motor kesayangan."
  },
  {
    "id": 3,
    "name": "Jaket Hoodie Polos",
    "price": 120000,
    "image": "https://via.placeholder.com/300x200?text=Hoodie",
    "description": "Hoodie tebal yang sangat cocok untuk dijadikan media sablon."
  }
];

// 3. Tugas untuk menampilkan produk ke layar
function loadProducts() {
    // Bersihkan tulisan "Sedang memuat data produk..."
    productList.innerHTML = '';

    // Jejerkan barangnya
    products.forEach(product => {
        const productCard = `
            <div class="bg-white border rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4">
                <h3 class="text-lg font-bold text-gray-800">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-4 flex-grow">${product.description}</p>
                <div class="mt-auto">
                    <p class="text-blue-600 font-bold text-xl mb-2">Rp ${product.price.toLocaleString('id-ID')}</p>
                    <button class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition" onclick="tambahKeKeranjang(${product.id})">
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `;
        // Masukkan kartu ke HTML
        productList.innerHTML += productCard;
    });
}

// 4. Perintahkan untuk langsung tampil!
loadProducts();
// ==========================================
// LANGKAH 3: LOGIKA KERANJANG & LOCALSTORAGE
// ==========================================

// Fungsi untuk mengambil keranjang dari saku (LocalStorage)
function getCart() {
    // Cek apakah ada data bernama 'cart_uts' di memori browser
    const cart = localStorage.getItem('cart_uts');
    // Jika ada, ubah teks menjadi bentuk data. Jika tidak ada, buat keranjang kosong [].
    return cart ? JSON.parse(cart) : [];
}

// Fungsi ini dipanggil saat tombol "Tambah ke Keranjang" diklik
function tambahKeKeranjang(idProduk) {
    // 1. Cari produk dari daftar barang berdasarkan ID-nya
    const produkYangDipilih = products.find(p => p.id === idProduk);
    
    // 2. Ambil keranjang yang sudah ada saat ini
    let cart = getCart();

    // 3. Masukkan barang yang diklik ke dalam keranjang
    cart.push(produkYangDipilih);

    // 4. Simpan kembali keranjang yang sudah terisi ke LocalStorage
    // Harus diubah jadi teks (JSON.stringify) karena LocalStorage cuma menerima teks
    localStorage.setItem('cart_uts', JSON.stringify(cart));

    // 5. Perbarui angka di pojok kanan atas layar
    updateCartCount();

    // 6. Beri notifikasi sederhana ke pembeli
    alert(produkYangDipilih.name + " berhasil masuk keranjang!");
}

// Fungsi untuk memperbarui angka keranjang di Navbar (Pojok Kanan Atas)
function updateCartCount() {
    const cart = getCart();
    // Cari elemen dengan ID 'cart-count' di HTML, lalu ganti teksnya dengan jumlah barang
    document.getElementById('cart-count').innerText = cart.length;
}

// Jalankan fungsi ini saat web pertama kali dibuka, 
// supaya angka keranjang tidak kembali ke 0 jika sebelumnya sudah ada belanjaan.
updateCartCount();
// ==========================================
// LANGKAH 4: LOGIKA CHECKOUT & RIWAYAT ORDER
// ==========================================

function prosesCheckout() {
    // 1. Cek dulu apakah keranjang ada isinya
    const cart = getCart();
    if (cart.length === 0) {
        alert("Keranjang masih kosong! Silakan tambah produk dulu.");
        return; // Hentikan proses kalau kosong
    }

    // 2. Ambil data yang diketik user di form
    const nama = document.getElementById('nama').value;
    const nohp = document.getElementById('nohp').value;
    const alamat = document.getElementById('alamat').value;

    // 3. Pastikan tidak ada kolom yang kosong
    if (!nama || !nohp || !alamat) {
        alert("Harap isi Nama, No HP, dan Alamat dengan lengkap!");
        return;
    }

    // 4. Buat ID Transaksi acak sesuai syarat UTS (contoh: TRX-84729)
    const idTransaksi = "TRX-" + Math.floor(Math.random() * 100000);

    // 5. Bungkus semua data order menjadi satu
    const orderData = {
        id: idTransaksi,
        namaPemesan: nama,
        hp: nohp,
        alamat: alamat,
        barangBawaan: cart,
        waktuOrder: new Date().toLocaleString() // Catat waktu saat ini
    };

    // 6. Simpan pesanan ke 'Buku Riwayat' di LocalStorage
    let orders = localStorage.getItem('orders_uts');
    orders = orders ? JSON.parse(orders) : []; // Kalau belum ada riwayat, buat array kosong
    
    orders.push(orderData); // Masukkan pesanan baru ke riwayat
    localStorage.setItem('orders_uts', JSON.stringify(orders)); // Simpan kembali

    // 7. Setelah sukses, kosongkan keranjang!
    localStorage.removeItem('cart_uts');
    updateCartCount(); // Update angka di pojok kanan atas jadi 0 lagi

    // 8. Kosongkan isian form biar rapi
    document.getElementById('nama').value = '';
    document.getElementById('nohp').value = '';
    document.getElementById('alamat').value = '';

    // 9. Beri tahu user kalau sukses
    alert("Hore! Pesanan " + idTransaksi + " berhasil dibuat. Terima kasih, " + nama + "!");
}