import { h, render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { BUNDLED_THEMES } from "shiki";
import { TRIGGERS } from "./types";
import { setConfig } from "./utils";

const Options = () => {
  const [trigger, setTrigger] = useState("always");
  const [theme, setTheme] = useState("nord");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    // Save options to storage
    if (isFirst.current) {
      isFirst.current = false;
      return;
    } else {
      (async () => {
        await setConfig({ trigger: trigger as any, theme, isDebugMode });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 1000);
      })();
    }
  }, [trigger, theme, isDebugMode]);

  return (
    <div className="py-10 px-5 relative">
      {isSaved && (
        <div className="text-sm text-secondary absolute right-5 top-3">
          Saved!
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="form-control w-full">
          <label className="label cursor-pointer">
            <span className="label-text">Trigger</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={trigger}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setTrigger(value);
            }}
          >
            {TRIGGERS.map((trigger) => (
              <option key={trigger} value={trigger}>
                {trigger}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Theme</span>
            <a
              className="link link-primary"
              href="https://vscodethemes.com/"
              target="_blank"
            >
              example
            </a>
          </label>
          <select
            className="select select-bordered select-sm"
            value={theme}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setTheme(value);
            }}
          >
            {BUNDLED_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-full">
          <label className="label cursor-pointer">
            <span className="label-text">Debug mode</span>
            <input
              type="checkbox"
              checked={isDebugMode}
              className="checkbox"
              onChange={() => setIsDebugMode((prev) => !prev)}
            />
          </label>
        </div>
        {/* <div className="form-control w-full max-w-xs">
					<label className="label">
						<span className="label-text">Layout</span>
					</label>
					<select className="select select-bordered select-sm">
						<option value="">Layout1</option>
					</select>
				</div> */}
      </div>
    </div>
  );
};

render(<Options />, document.body);
