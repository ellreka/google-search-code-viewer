import { h, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { BUNDLED_THEMES } from "shiki";
import browser from "webextension-polyfill";

const Options = () => {
  const [trigger, setTrigger] = useState("always");
  const [theme, setTheme] = useState("nord");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load options from storage
    (async () => {
      const config = await browser.storage.local.get();
      console.log(config);
      if (config?.trigger) {
        setTrigger(config.trigger);
      }
      if (config?.theme) {
        setTheme(config.theme);
      }
    })();
  }, []);

  const save = async () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  const onChangeTheme: h.JSX.GenericEventHandler<HTMLSelectElement> = async (
    e,
  ) => {
    const { value } = e.currentTarget;
    setTheme(value);
    await browser.storage.local.set({ theme: value });
    save();
  };

  const onChangeTrigger: h.JSX.GenericEventHandler<HTMLSelectElement> = async (
    e,
  ) => {
    const { value } = e.currentTarget;
    setTrigger(value);
    await browser.storage.local.set({ trigger: value });
    save();
  };

  return (
    <div className="py-10 px-3 relative">
      {isSaved && (
        <div className="text-sm text-secondary absolute right-5 top-3">
          Saved!
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="form-control w-full max-w-xs">
          <label className="label cursor-pointer">
            <span className="label-text">Trigger</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={trigger}
            onChange={onChangeTrigger}
          >
            {["always", "button"].map((trigger) => (
              <option key={trigger} value={trigger}>
                {trigger}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-full max-w-xs">
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
            onChange={onChangeTheme}
          >
            {BUNDLED_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
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
