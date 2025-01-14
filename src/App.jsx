import { useEffect, useState } from "react";

async function fetchData(
  query = "",
  index = "articles",
  page = 1,
  attributes = ["*"],
  limit = 10
) {
  const url = import.meta.env.VITE_MEILI_URL;
  const key = import.meta.env.VITE_MEILI_CLIENT_KEY;
  const proxy = import.meta.env.VITE_PROXY_URL;
  const proxyKey = import.meta.env.VITE_PROXY_KEY;

  console.log(">>> url", url);

  const response = await fetch(`${proxy}${url}/indexes/${index}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "x-cors-api-key": proxyKey,
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify({
      q: query,
      page,
      attributesToSearchOn: attributes,
      hitsPerPage: limit,
    }),
  });

  if (!response.ok) {
    console.log(">>> response", response);
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

const SEARCH_FIELDS_MAPPING = {
  Title: "dc:title",
  Author: "indexAuthors",
  Affiliation: "indexAffiliation",
  Journal: "prism:publicationName",
};

const SEARCH_FIELDS_MAPPING_REVERSE = Object.fromEntries(
  Object.entries(SEARCH_FIELDS_MAPPING).map(([key, value]) => [value, key])
);

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("dc:title");
  const [currentPage, setCurrentPage] = useState(1);
  const [renderData, setRenderData] = useState(null);

  useEffect(() => {
    const delayFetch = setTimeout(() => {
      fetchData(searchTerm, "articles", currentPage, [searchField], 10).then(
        (data) => {
          console.log(">>> renderData", data.hits); // Log the correct data
          setRenderData(data.hits); // Set the fetched data
        }
      );
    }, 500); // Delay of 500ms

    return () => clearTimeout(delayFetch); // Cleanup timeout on dependency change
  }, [searchTerm, currentPage, searchField]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchFieldChange = (event) => {
    console.log(">>> event.target.value", event.target.value);
    setSearchField(event.target.value);
    setCurrentPage(1); // Reset to first page on new search field
    setSearchTerm(""); // Reset search term on new search field
  };

  return (
    <>
      <header></header>
      <main className="container-fluid">
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="search"
            placeholder={`Search by ${SEARCH_FIELDS_MAPPING_REVERSE[
              searchField
            ].toLowerCase()}`}
            value={searchTerm}
            onChange={handleSearch}
            style={{ flex: "0 0 80%" }}
          />
          <select
            onChange={handleSearchFieldChange}
            style={{ flex: "0 0 20%" }}
          >
            {Object.keys(SEARCH_FIELDS_MAPPING).map((field) => (
              <option key={field} value={SEARCH_FIELDS_MAPPING[field]}>
                {field}
              </option>
            ))}
          </select>
        </div>

        {renderData &&
          renderData.map((item, index) => {
            return (
              <div key={index}>
                <h2
                  dangerouslySetInnerHTML={{
                    __html: item["dc:title"],
                  }}
                ></h2>
                <p>
                  <strong>Author:</strong>{" "}
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
                      authorName +
                      (idx !== item["author"].length - 1 ? "; " : "")
                    );
                  })}
                </p>
                <p>
                  <strong>Affiliation:</strong>{" "}
                  {Array.isArray(item["affiliation"]) &&
                    item["affiliation"]
                      .map((affil) => {
                        return [
                          Array.isArray(affil["affilname"])
                            ? affil["affilname"].join(", ")
                            : affil["affilname"],
                          affil["affiliation-city"],
                          affil["affiliation-country"],
                        ]
                          .filter(Boolean)
                          .join(", ");
                      })
                      .join("; ")}
                </p>
                {item["prism:doi"] && (
                  <p>
                    <strong>DOI:</strong> {item["prism:doi"]}
                  </p>
                )}
                <p>
                  <strong>Journal:</strong> {item["prism:publicationName"]}
                </p>
                <p>
                  <strong>Publication Date:</strong>{" "}
                  {item["prism:coverDisplayDate"]} ({item["prism:coverDate"]})
                </p>
                <p>
                  <strong>Cited-by Count:</strong> {item["citedby-count"]}
                </p>
              </div>
            );
          })}

        <br />
        <div>
          <label htmlFor="page-select">Go to page: </label>
          <input
            type="number"
            id="page-select"
            min="1"
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            onBlur={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{ width: "150px" }}
          />
        </div>
      </main>
    </>
  );
}

export default App;
