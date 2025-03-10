export function createDocsStore<T>() {
  let rawDocs = readFromLS() as { [key: string]: T };
  let initialDocsStores = Object.entries(rawDocs).reduce((all, [hash, doc]) => {
    all[hash] = createDocStore(doc);
    return all;
  }, {});
  let docs = $state<{
    [key: string]: ReturnType<typeof createDocStore<T>> | null;
  }>(initialDocsStores);

  $effect(() => {
    const forLS = Object.entries(docs).reduce(
      (all, [hash, doc]) => {
        all[hash] = doc.doc;
        return all;
      },
      {} as { [key: string]: T },
    );
    saveToLS(forLS);
  });

  function createDocument(initialState: T) {
    const hash = crypto.randomUUID();
    docs[hash] = createDocStore(initialState);
    return hash;
  }

  function setDocument(hash: string, doc: T) {
    docs[hash] = createDocStore(doc);
  }

  function deleteDocument(hash: string) {
    delete docs[hash];
  }

  return {
    createDocument,
    deleteDocument,
    setDocument,
    get docs() {
      return docs;
    },
  };
}

export type DocStore<T> = ReturnType<typeof createDocStore<T>>;

function createDocStore<T>(initialDoc: T) {
  let doc = $state<T>(initialDoc);

  function update(newDoc: Partial<T>) {
    doc = { ...doc, newDoc };
  }

  return {
    update,
    get doc() {
      return doc;
    },
  };
}

const LS_KEY = 'docs';

function readFromLS() {
  const value = localStorage.getItem(LS_KEY);
  try {
    const parsed = JSON.parse(value);
    return parsed || {};
  } catch (e) {
    return {};
  }
}

function saveToLS(value: any) {
  localStorage.setItem(LS_KEY, JSON.stringify(value));
}
