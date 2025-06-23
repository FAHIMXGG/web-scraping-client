import { ArrowRight, MapPinLine, MagnifyingGlass } from "phosphor-react";
import { SearchBar, Dropdown, Button, Spinner } from "keep-react";
import { useState } from "react";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(false)

  const handleOnChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  const handleSearch = () => {
    setLoading(true);

    fetch(`https://web2-server.vercel.app/https:/${searchTerm}`)
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

  console.log(searchData)

  return (
    <>
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
          >
            {loading ? "Loading..." : "Search"}
          </Button>
          
        }
        addonPosition="right"
        size="lg"
        color="success"
        icon={<MagnifyingGlass size={20} color="#008000" />}
        iconPosition="left"
      ></SearchBar>

      <div className="py-5 flex justify-center">
        {loading && <Spinner color="success" size="lg" />}
      </div>

      <div className="flex justify-center flex-col gap-5">
        {searchData ? <div>
          <div className="flex justify-between">
            <h1>Result For: <span className="text-green-600 font-bold">{searchData?.url}</span></h1>
            <h1>Load time: <span className="text-green-600 font-bold">{searchData?.responseTime}ms</span></h1>
          </div>
          <div>
            <h1 className="py-5 text-center">Meta tags</h1>
            {
              searchData?.metaTags?.map((meta, index) => (
                <h1 key={index}>{meta?.name}:{meta?.content}</h1>
              ))
            }
          </div>
          <div>
            <h1 className="py-5 text-center">Links</h1>
            {
              searchData?.links?.map((link, index) => (
                <h1 key={index}>{link}</h1>
              ))
            }
          </div>
          <div>
            <h1 className="py-5 text-center">img</h1>
            {
              searchData?.imgs?.map((img, index) => (
                <div key={index}>
                <h1 >{img}</h1>
                <img src={img} alt="" />
                </div>
              ))
            }
          </div>
        </div> : <></>}
      </div>


    </>
  );
};

export default App;
