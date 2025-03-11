export function createDocsStore<T>(fromJSON: (v: any) => T) {
  type TMap = { [key: string]: T };
  const LS = localStorageDB<TMap>('docs', {});
  let docs = $state<TMap>(
    Object.entries(LS.read()).reduce((acc, [hash, doc]) => {
      acc[hash] = fromJSON(doc);
      return acc;
    }, {} as TMap),
  );
  $effect(() => LS.write(docs));

  function createDocument(initialState: T) {
    const hash = crypto.randomUUID();
    docs[hash] = initialState;
    return hash;
  }

  function setDocument(hash: string, doc: T) {
    docs[hash] = doc;
  }

  function deleteDocument(hash: string) {
    delete docs[hash];
  }

  function updateDocument(hash: string, doc: Partial<T>) {
    for (let key in doc) {
      docs[hash][key] = doc[key];
    }
  }

  return {
    createDocument,
    deleteDocument,
    setDocument,
    updateDocument,
    get docs() {
      return docs;
    },
  };
}

// export type DocStore<T> = ReturnType<typeof createDocStore<T>>;

// function createDocStore<T>(initialDoc: T) {
//   let doc = $state<T>(initialDoc);

//   function update(newDoc: Partial<T>) {
//     doc = { ...doc, newDoc };
//   }

//   return {
//     update,
//     get doc() {
//       return doc;
//     },
//   };
// }

function localStorageDB<T>(key: string, initial: T) {
  function read(reviver?: (key: string, value: any) => any) {
    const value = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(value, reviver);
      return (parsed || initial) as T;
    } catch (e) {
      return initial as T;
    }
  }

  function write(value: T, replacer?: (key: string, value: any) => any) {
    localStorage.setItem(key, JSON.stringify(value, replacer));
  }

  return {
    read,
    write,
  };
}

// function readFromLS<T>(reviver?: (key: string, value: any) => any) {
//   const value = localStorage.getItem(LS_KEY);
//   try {
//     const parsed = JSON.parse(value, reviver);
//     return (parsed || {}) as T;
//   } catch (e) {
//     return {} as T;
//   }
// }

// function saveToLS<T>(value: T, replacer?: (key: string, value: any) => any) {
//   localStorage.setItem(LS_KEY, JSON.stringify(value, replacer));
// }
