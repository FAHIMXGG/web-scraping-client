import { ArrowRight, MapPinLine, MagnifyingGlass } from "phosphor-react";
import { SearchBar, Dropdown, Button, Spinner } from "keep-react";
import { useState } from "react";
import JSZip from "jszip";

const domainRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,6}$/;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const cleanedUrl = searchData?.url?.replace("https:/", "") || "";

  const handleOnChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  const sanitizeDomain = (input) => {
    let domain = input.trim();
    domain = domain.replace(/^@/, '');
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.replace(/\/$/, '');
    return domain;
  };

  const handleSearch = () => {
    const sanitized = sanitizeDomain(searchTerm);
    if (!domainRegex.test(sanitized)) {
      setModalError("Please enter a valid domain, e.g. example.com");
      setShowModal(true);
      return;
    }
    setLoading(true);

    fetch(`https://web2-server.vercel.app/https:/${sanitized}`)
      .then((response) => response.json())
      .then((data) => {
        setSearchData(data)
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownloadAllImages = async () => {
    if (!searchData?.imgs?.length) return;
    const zip = new JSZip();
    const folder = zip.folder("images");
    for (let i = 0; i < searchData.imgs.length; i++) {
      const imgUrl = searchData.imgs[i];
      try {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        let extension = '.jpg';
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('image/')) {
          let ext = contentType.split('/')[1].split(';')[0];
          extension = '.' + ext;
        } else {
          const urlExt = imgUrl.split('.').pop().split('?')[0];
          if (urlExt && urlExt.length <= 5) extension = '.' + urlExt;
        }
        folder.file(`image_${i + 1}${extension}`, blob);
      } catch (err) {
        console.error('Failed to fetch image:', imgUrl, err);
      }
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = "all_images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    });
  };

  console.log(searchData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-start py-10 px-2">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Domain</h2>
            <p className="mb-4 text-gray-700">{modalError}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-2 tracking-tight">Web Analyzer</h1>
        
        <SearchBar
          placeholder="example.com"
          handleOnChange={handleOnChange}
          bordered={false}
          addon={
            <Button
              type="primary"
              color="success"
              size="xs"
              onClick={handleSearch}
              className="transition-all duration-200 hover:scale-105"
            >
              {loading ? "Loading..." : "Search"}
            </Button>
          }
          addonPosition="right"
          size="lg"
          color="success"
          icon={<MagnifyingGlass size={20} color="#008000" />}
          iconPosition="left"
          className="shadow-md rounded-lg"
        ></SearchBar>

        <div className="flex justify-center py-2 min-h-[40px]">
          {loading && <Spinner color="success" size="lg" />}
        </div>

        <div className="flex flex-col gap-8">
          {searchData ? (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:justify-between gap-2 items-center bg-green-50 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold">Result For: <span className="text-green-600 font-bold">{cleanedUrl}</span></h2>
                <h2 className="text-lg font-semibold">Load time: <span className="text-green-600 font-bold">{searchData?.responseTime}ms</span></h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="py-2 text-xl font-semibold text-center text-green-700">Meta tags</h3>
                <ul className="divide-y divide-green-100">
                  {searchData?.metaTags?.map((meta, index) => (
                    <li key={index} className="py-1 px-2 flex justify-between text-gray-700">
                      <span className="font-medium">{meta?.name}</span>
                      <span className="truncate max-w-xs">{meta?.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="py-2 text-xl font-semibold text-center text-green-700">Links</h3>
                <ul className="space-y-1">
                  {searchData?.links?.map((link, index) => (
                    <li key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline hover:text-green-800 transition-colors duration-150 break-all">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="py-2 text-xl font-semibold text-center text-green-700 flex items-center justify-center gap-4">
                  Images
                  {searchData?.imgs?.length > 0 && (
                    <button
                      onClick={handleDownloadAllImages}
                      className="ml-2 px-3 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors duration-150 text-sm font-medium"
                    >
                      Download All Images
                    </button>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchData?.imgs?.map((img, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 bg-white rounded-lg p-2 shadow hover:shadow-md transition-shadow duration-200">
                      <a href={img} target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline break-all">{img}</a>
                      <img src={img} alt="" className="max-h-32 rounded-md object-contain border border-green-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
