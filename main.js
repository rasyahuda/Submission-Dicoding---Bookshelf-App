const books = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  const bookFormSubmit = document.getElementById('bookFormSubmit');
  const bookFormIsComplete = document.getElementById('bookFormIsComplete');

  const searchBookForm = document.getElementById('searchBook');
  const searchBookTitle = document.getElementById('searchBookTitle');

  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  // Modal konfirmasi hapus
  const confirmModal = document.getElementById('customConfirmModal');
  const confirmMessage = document.getElementById('customConfirmMessage');
  const confirmYes = document.getElementById('customConfirmYes');
  const confirmNo = document.getElementById('customConfirmNo');
  let bookToDelete = null;

  // Modal edit
  const editModal = document.getElementById('editBookModal');
  const editBookForm = document.getElementById('editBookForm');
  const editBookId = document.getElementById('editBookId');
  const editBookTitle = document.getElementById('editBookTitle');
  const editBookAuthor = document.getElementById('editBookAuthor');
  const editBookYear = document.getElementById('editBookYear');
  const editBookSave = document.getElementById('editBookSave');
  const editBookCancel = document.getElementById('editBookCancel');

  // Cek apakah localStorage didukung oleh browser.
  function isStorageExist() {
    if (typeof Storage === 'undefined') {
      alert('Browser Anda tidak mendukung local storage');
      return false;
    }
    return true;
  }

  // Simpan data buku ke localStorage.
  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  // Muat data buku dari localStorage.
  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  // Buat ID unik untuk buku.
  function generateId() {
    return +new Date();
  }

  // Buat objek buku baru.
  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year: parseInt(year), // Pastikan tahun adalah angka
      isComplete,
    };
  }

  // Cari buku berdasarkan ID.
  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  // Cari index buku berdasarkan ID.
  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }

  // Buat elemen DOM untuk satu buku.
  function makeBookElement(bookObject) {
    // Definisikan kelas dasar Tailwind untuk tombol
    const baseButtonClass =
      'text-sm font-bold py-2 px-4 rounded-md cursor-pointer transition-all duration-200 shadow hover:opacity-85 hover:shadow-md flex-grow';

    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');
    // Terapkan kelas Tailwind untuk item buku
    container.className =
      'border border-stone-200 p-4 mb-4 rounded-md bg-stone-50';

    const title = document.createElement('h3');
    title.setAttribute('data-testid', 'bookItemTitle');
    title.innerText = bookObject.title;
    // Terapkan kelas Tailwind untuk judul
    title.className = 'text-xl font-bold text-stone-800 mb-2 break-words';

    const author = document.createElement('p');
    author.setAttribute('data-testid', 'bookItemAuthor');
    author.innerText = `Penulis: ${bookObject.author}`;
    // Terapkan kelas Tailwind untuk penulis
    author.className = 'text-sm text-stone-600 mb-1';

    const year = document.createElement('p');
    year.setAttribute('data-testid', 'bookItemYear');
    year.innerText = `Tahun: ${bookObject.year}`;
    // Terapkan kelas Tailwind untuk tahun
    year.className = 'text-sm text-stone-600 mb-1';

    const actionContainer = document.createElement('div');
    // Terapkan kelas Tailwind untuk kontainer aksi
    actionContainer.className = 'mt-4 flex flex-wrap gap-2';

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    // Terapkan kelas Tailwind untuk tombol hapus
    deleteButton.className = `${baseButtonClass} bg-red-600 text-white`;

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    // Terapkan kelas Tailwind untuk tombol edit
    editButton.className = `${baseButtonClass} bg-yellow-500 text-stone-900`;

    const moveButton = document.createElement('button');
    moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    // Terapkan kelas Tailwind untuk tombol pindah (hijau)
    moveButton.className = `${baseButtonClass} bg-lime-600 text-white`;

    if (bookObject.isComplete) {
      moveButton.innerText = 'Belum selesai dibaca';
    } else {
      moveButton.innerText = 'Selesai dibaca';
    }

    // Tambahkan event listener langsung ke tombol
    deleteButton.addEventListener('click', function () {
      showDeleteConfirm(bookObject.id);
    });

    editButton.addEventListener('click', function () {
      showEditModal(bookObject.id);
    });

    moveButton.addEventListener('click', function () {
      moveBook(bookObject.id);
    });

    actionContainer.append(moveButton, deleteButton, editButton);
    container.append(title, author, year, actionContainer);

    return container;
  }

  // Tambah buku baru.
  function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(
      generatedID,
      title,
      author,
      year,
      isComplete
    );
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    // Reset form
    bookForm.reset();
  }

  // Pindahkan buku antar rak.
  function moveBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // Hapus buku dari list.
  function removeBook(bookId) {
    const bookTargetIndex = findBookIndex(bookId);

    if (bookTargetIndex === -1) return;

    books.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // Tampilkan modal konfirmasi hapus.
  function showDeleteConfirm(bookId) {
    bookToDelete = bookId;
    const book = findBook(bookId);
    confirmMessage.innerText = `Apakah Anda yakin ingin menghapus buku "${book.title}"?`;
    confirmModal.style.display = 'flex';
  }

  // Event listener untuk tombol 'Ya' di modal konfirmasi
  confirmYes.addEventListener('click', function () {
    if (bookToDelete) {
      removeBook(bookToDelete);
    }
    confirmModal.style.display = 'none';
    bookToDelete = null;
  });

  // Event listener untuk tombol 'Tidak' di modal konfirmasi
  confirmNo.addEventListener('click', function () {
    confirmModal.style.display = 'none';
    bookToDelete = null;
  });

  /**
   * Tampilkan modal edit buku.
   */
  function showEditModal(bookId) {
    const bookToEdit = findBook(bookId);
    if (!bookToEdit) return;

    editBookId.value = bookToEdit.id;
    editBookTitle.value = bookToEdit.title;
    editBookAuthor.value = bookToEdit.author;
    editBookYear.value = bookToEdit.year;

    editModal.style.display = 'flex';
  }

  /**
   * Simpan perubahan dari modal edit.
   */
  function saveBookEdit() {
    const bookId = parseInt(editBookId.value);
    const book = findBook(bookId);

    if (!book) return;

    book.title = editBookTitle.value;
    book.author = editBookAuthor.value;
    book.year = parseInt(editBookYear.value);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    editModal.style.display = 'none';
    editBookForm.reset();
  }

  // Event listener untuk form edit
  editBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    saveBookEdit();
  });

  // Event listener untuk tombol batal edit
  editBookCancel.addEventListener('click', function () {
    editModal.style.display = 'none';
    editBookForm.reset();
  });

  /**
   * Cari buku berdasarkan judul.
   */
  function searchBook() {
    const query = searchBookTitle.value.toLowerCase();
    const allBookItems = document.querySelectorAll(
      '[data-testid="bookItem"]'
    );

    allBookItems.forEach((item) => {
      const title = item
        .querySelector('[data-testid="bookItemTitle"]')
        .innerText.toLowerCase();
      if (title.includes(query)) {
        item.style.display = ''; // Tampilkan jika cocok
      } else {
        item.style.display = 'none'; // Sembunyikan jika tidak cocok
      }
    });
  }

  // Event listener untuk form submit (Tambah Buku)
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  // Event listener untuk mengubah teks tombol submit berdasarkan checkbox
  bookFormIsComplete.addEventListener('change', function () {
    const submitSpan = bookFormSubmit.querySelector('span');
    if (bookFormIsComplete.checked) {
      submitSpan.innerText = 'Selesai dibaca';
    } else {
      submitSpan.innerText = 'Belum selesai dibaca';
    }
  });

  // Event listener untuk form pencarian
  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  // Event listener untuk pencarian real-time saat mengetik
  searchBookTitle.addEventListener('keyup', function () {
    searchBook();
  });

  // Event listener untuk merender ulang UI
  document.addEventListener(RENDER_EVENT, function () {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
      const bookElement = makeBookElement(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookList.append(bookElement);
      } else {
        completeBookList.append(bookElement);
      }
    }
  });

  // Event listener untuk konfirmasi penyimpanan (opsional)
  document.addEventListener(SAVED_EVENT, function () {
    console.log('Data berhasil disimpan.');
  });

  // Muat data saat halaman dimuat
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
