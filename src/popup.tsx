import { h, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { bundledThemes } from "shiki/themes";
import { TRIGGERS, LAYOUTS } from "./types";
import { getConfig, setConfig } from "./utils";

const Popup = () => {
  const [trigger, setTrigger] = useState<string>(TRIGGERS[0]);
  const [theme, setTheme] = useState("nord");
  const [layout, setLayout] = useState<string>(LAYOUTS[0]);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load options from storage
  useEffect(() => {
    (async () => {
      const config = await getConfig();
      setTrigger(config.trigger);
      setTheme(config.theme);
      setLayout(config.layout);
      setIsDebugMode(config.isDebugMode);
    })();
  }, []);

  // Save options to storage
  useEffect(() => {
    (async () => {
      await setConfig({
        trigger: trigger as any,
        theme,
        layout: layout as any,
        isDebugMode,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
    })();
  }, [trigger, theme, layout, isDebugMode]);

  return (
    <div className="p-5 relative">
      <h1 className="text-lg font-bold">Settings</h1>
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
            {Object.keys(bundledThemes).map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Layout</span>
          </label>
          <select
            className="select select-bordered select-sm"
            onChange={(e) => {
              const { value } = e.currentTarget;
              setLayout(value);
            }}
          >
            {LAYOUTS.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
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
      </div>
    </div>
  );
};

render(<Popup />, document.body);
