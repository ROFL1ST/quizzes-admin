import Papa from "papaparse";

export const downloadCSVTemplate = () => {
  const headers = [
    "question",
    "type",
    "correct",
    "options",
    "difficulty",
    "hint",
  ];
  const exampleRow = [
    "What is the capital of Indonesia?",
    "mcq",
    "Jakarta",
    "Jakarta|Bandung|Surabaya|Bali",
    "0.2",
    "It starts with J",
  ];

  const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "question_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (file, callback) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      callback(results.data);
    },
    error: (err) => {
      console.error("CSV Parse Error", err);
      callback(null, err);
    },
  });
};
