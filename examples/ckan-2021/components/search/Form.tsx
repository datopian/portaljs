import { useState } from 'react';
import { useRouter } from 'next/router';

const SearchForm: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    router.push({
      pathname: '/search',
      query: { q: searchQuery },
    });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="items-center">
      <input
        id="search2"
        type="search"
        name="search"
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        placeholder="GDP data..."
        aria-label="Search"
        className="inline-block w-1/2 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <button
        onClick={() => handleSubmit(false)}
        type="button"
        className="inline-block text-sm px-4 py-3 mx-3 leading-none border rounded text-white bg-black border-black lg:mt-0"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;
