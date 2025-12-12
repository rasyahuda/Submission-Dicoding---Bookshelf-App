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

  // Variabel untuk Modal Edit 
  const editModal = document.getElementById('editBookModal');
  const editBookForm = document.getElementById('editBookForm');
  const editBookId = document.getElementById('editBookId');
  const editBookTitle = document.getElementById('editBookTitle');
  const editBookAuthor = document.getElementById('editBookAuthor');
  const editBookYear = document.getElementById('editBookYear');
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
      year: parseInt(year),
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
    const baseButtonClass =
      'text-sm font-bold py-2 px-4 rounded-md cursor-pointer transition-all duration-200 shadow hover:opacity-85 hover:shadow-md flex-grow';

    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');
    container.className =
      'border border-stone-200 p-4 mb-4 rounded-md bg-stone-50';

    const title = document.createElement('h3');
    title.setAttribute('data-testid', 'bookItemTitle');
    title.innerText = bookObject.title;
    title.className = 'text-xl font-bold text-stone-800 mb-2 break-words';

    const author = document.createElement('p');
    author.setAttribute('data-testid', 'bookItemAuthor');
    author.innerText = `Penulis: ${bookObject.author}`;
    author.className = 'text-sm text-stone-600 mb-1';

    const year = document.createElement('p');
    year.setAttribute('data-testid', 'bookItemYear');
    year.innerText = `Tahun: ${bookObject.year}`;
    year.className = 'text-sm text-stone-600 mb-1';

    const actionContainer = document.createElement('div');
    actionContainer.className = 'mt-4 flex flex-wrap gap-2';

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.className = `${baseButtonClass} bg-red-600 text-white`;

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.className = `${baseButtonClass} bg-yellow-500 text-stone-900`;

    const moveButton = document.createElement('button');
    moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    moveButton.className = `${baseButtonClass} bg-lime-600 text-white`;

    if (bookObject.isComplete) {
      moveButton.innerText = 'Belum selesai dibaca';
    } else {
      moveButton.innerText = 'Selesai dibaca';
    }

    // --- PERUBAHAN DI SINI ---
    // Event listener langsung memanggil removeBook tanpa konfirmasi
    deleteButton.addEventListener('click', function () {
      removeBook(bookObject.id);
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

  // Hapus buku dari list (Langsung Hapus & Simpan).
  function removeBook(bookId) {
    const bookTargetIndex = findBookIndex(bookId);

    if (bookTargetIndex === -1) return;

    books.splice(bookTargetIndex, 1); // Hapus dari array
    document.dispatchEvent(new Event(RENDER_EVENT)); // Update Tampilan
    saveData(); // Update LocalStorage
  }

  // --- LOGIKA MODAL EDIT (Masih ada sesuai kode awal) ---

  function showEditModal(bookId) {
    const bookToEdit = findBook(bookId);
    if (!bookToEdit) return;

    editBookId.value = bookToEdit.id;
    editBookTitle.value = bookToEdit.title;
    editBookAuthor.value = bookToEdit.author;
    editBookYear.value = bookToEdit.year;

    editModal.style.display = 'flex';
  }

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

  editBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    saveBookEdit();
  });

  editBookCancel.addEventListener('click', function () {
    editModal.style.display = 'none';
    editBookForm.reset();
  });

  // --- FITUR PENCARIAN ---

  function searchBook() {
    const query = searchBookTitle.value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(query)
    );

    const incompleteList = document.getElementById('incompleteBookList');
    const completeList = document.getElementById('completeBookList');
    
    incompleteList.innerHTML = '';
    completeList.innerHTML = '';
    
    for (const bookItem of filteredBooks) {
        const bookElement = makeBookElement(bookItem);
        if (!bookItem.isComplete) {
            incompleteList.append(bookElement);
        } else {
            completeList.append(bookElement);
        }
    }
    
    if (query === "") {
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }

  // Event Listeners Umum
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  bookFormIsComplete.addEventListener('change', function () {
    const submitSpan = bookFormSubmit.querySelector('span');
    if (bookFormIsComplete.checked) {
      submitSpan.innerText = 'Selesai dibaca';
    } else {
      submitSpan.innerText = 'Belum selesai dibaca';
    }
  });

  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  searchBookTitle.addEventListener('keyup', function () {
    searchBook();
  });

  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
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

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
