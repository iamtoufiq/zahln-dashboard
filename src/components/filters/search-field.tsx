import { type FormEvent, useEffect, useState } from "react";

import { CloseIcon, SearchIcon } from "@/components/icons";
import { useT } from "@/lib/locale";

type Props = { value: string; onSearch: (text: string) => void };

// Searches on Enter, so fast typing never races a request.
export function SearchField({ value, onSearch }: Props) {
  const { t } = useT();
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(text);
  }

  function clear() {
    setText("");
    onSearch("");
  }

  return (
    <form className="search-field" role="search" onSubmit={submit}>
      <span className="search-icon">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("payments.searchPlaceholder")}
        aria-label={t("payments.search")}
      />
      {text ? (
        <button
          type="button"
          className="icon-button"
          onClick={clear}
          aria-label={t("payments.clearSearch")}
        >
          <CloseIcon />
        </button>
      ) : null}
    </form>
  );
}
