// import data from "../data_2023_with_author.json";
import { useState } from "react";
import JSZip from "jszip";

// load the data from the zipped json file
const data = await fetchAndParseJsonFromZip();

async function fetchAndParseJsonFromZip() {
  const dataRaw = await fetch("data_2023_with_author.zip");
  const zipBlob = await dataRaw.blob();
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipBlob);
  const jsonFileName = Object.keys(zipContent.files).find((fileName) =>
    fileName.endsWith(".json")
  );

  if (!jsonFileName) {
    throw new Error("No JSON file found in the zip.");
  }

  // Extract and parse the JSON file
  const jsonFileContent = await zipContent.files[jsonFileName].async("string");
  const data = JSON.parse(jsonFileContent);
  return data;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const renderData = data;

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredData = renderData.filter((item) =>
    item["dc:title"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <>
      <header></header>
      <main className="container-fluid">
        <input
          type="search"
          placeholder="Search by title"
          value={searchTerm}
          onChange={handleSearch}
        />

        {paginatedData.map((item, index) => {
          return (
            <div key={index}>
              <h2
                dangerouslySetInnerHTML={{
                  __html: item["dc:title"],
                }}
              ></h2>
              <p>
                {" "}
                Author:{" "}
                {item["author"].map((author, idx) => {
                  if (typeof author === "string") {
                    return author;
                  }
                  const authorName =
                    (author["name"] || " ") +
                    (author["family"] || "") +
                    " " +
                    (author["given"] || "");
                  return (
                    authorName + (idx !== item["author"].length - 1 ? "; " : "")
                  );
                })}
              </p>
              <p>DOI: {item["prism:doi"]}</p>
            </div>
          );
        })}

        <div>
          {Array.from({ length: totalPages }, (_, index) => {
            if (totalPages > 10) {
              if (
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 2 && index <= currentPage + 2)
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    disabled={currentPage === index + 1}
                    style={{
                      margin: "1px",
                    }}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                index === currentPage - 3 ||
                index === currentPage + 3
              ) {
                return <span key={index}>...</span>;
              } else {
                return null;
              }
            } else {
              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  disabled={currentPage === index + 1}
                  style={{
                    margin: "1px",
                  }}
                >
                  {index + 1}
                </button>
              );
            }
          })}
        </div>

        <br />
        <div>
          <label htmlFor="page-select">Go to page: </label>
          <input
            type="number"
            id="page-select"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            style={{ width: "150px" }}
          />
        </div>
      </main>
    </>
  );
}

export default App;
