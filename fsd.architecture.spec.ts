import "tsarch/dist/jest";
import { extractGraph } from "tsarch/dist/src/common/extraction/extractGraph.js";
import { projectEdges } from "tsarch/dist/src/common/projection/projectEdges.js";
import { filesOfProject } from "tsarch";
import { sliceByRegex } from "tsarch/dist/src/slices/projection/slicingProjections.js";
import path from "node:path";
import { Edge } from "tsarch/dist/src/common/extraction/graph";

const tsConfigAppPath = path.join(process.cwd(), "tsconfig.app.json");

const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const archTestTimeoutMs = SECONDS_PER_MINUTE * MS_PER_SECOND;

const project = filesOfProject(tsConfigAppPath);

const layer = {
  app: "src/app/.*",
  entities: "src/entities/.*",
  features: "src/features/.*",
  pages: "src/pages/.*",
  shared: "src/shared/.*",
  widgets: "src/widgets/.*",
} as const;

const notAppLayers = "src/(shared|entities|features|widgets|pages)/.*";

const crossSlicePattern = (
  segment: "entities" | "features" | "pages" | "widgets",
) => new RegExp(`^src/${segment}/([^/]+)/`);

async function assertNoCrossSliceImports(
  segment: "entities" | "features" | "pages" | "widgets",
): Promise<void> {
  const graph = await extractGraph(tsConfigAppPath);
  const mapped = projectEdges(graph, sliceByRegex(crossSlicePattern(segment)));
  expect(mapped).toEqual([]);
}

describe("FSD Architecture — layer dependencies", () => {
  jest.setTimeout(archTestTimeoutMs);

  it("shared should not depend on other layers", async () => {
    await expect(
      project
        .matchingPattern(layer.shared)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/(app|pages|widgets|features|entities)/.*"),
    ).toPassAsync();
  });

  it("entities should depend only on shared", async () => {
    await expect(
      project
        .matchingPattern(layer.entities)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/(features|widgets|pages|app)/.*"),
    ).toPassAsync();
  });

  it("features should depend only on entities and shared", async () => {
    await expect(
      project
        .matchingPattern(layer.features)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/(widgets|pages|app)/.*"),
    ).toPassAsync();
  });

  it("widgets should not depend on pages or app", async () => {
    await expect(
      project
        .matchingPattern(layer.widgets)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/(pages|app)/.*"),
    ).toPassAsync();
  });

  it("pages should not depend on app", async () => {
    await expect(
      project
        .matchingPattern(layer.pages)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern(layer.app),
    ).toPassAsync();
  });

  it("no one should import app layer", async () => {
    await expect(
      project
        .matchingPattern(notAppLayers)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern(layer.app),
    ).toPassAsync();
  });
});

describe("FSD Architecture — cross-slice", () => {
  jest.setTimeout(archTestTimeoutMs);

  it("features slices should not depend on each other (no cross-slice imports)", async () => {
    await assertNoCrossSliceImports("features");
  });

  it("entities slices should not depend on each other", async () => {
    await assertNoCrossSliceImports("entities");
  });

  it("widgets should not depend on other widgets", async () => {
    await assertNoCrossSliceImports("widgets");
  });

  it("pages should not depend on other pages", async () => {
    await assertNoCrossSliceImports("pages");
  });
});

describe("FSD Architecture — segments and public API", () => {
  jest.setTimeout(archTestTimeoutMs);

  it("should not import internal modules of features (only public API)", async () => {
    await expect(
      project
        .matchingPattern("src/.*")
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/features/[^/]+/(model|lib|ui|api|config)/.*"),
    ).toPassAsync();
  });

  it("should not import internal modules of other entity slices (only public API)", async () => {
    const graph = await extractGraph(tsConfigAppPath);

    const sliceRegex = /^src\/entities\/([^/]+)\//u;
    const segmentRegex =
      /^src\/entities\/([^/]+)\/(model|lib|ui|api|config)\//u;

    const violations = projectEdges(graph, (edge: Edge) => {
      if (edge.external) {
        return;
      }

      const fromSlice = edge.source.match(sliceRegex)?.[1];
      const toSlice = edge.target.match(sliceRegex)?.[1];
      const isInternalTarget = segmentRegex.test(edge.target);

      if (!fromSlice || !toSlice) {
        return;
      }

      if (fromSlice !== toSlice && isInternalTarget) {
        return { sourceLabel: fromSlice, targetLabel: toSlice };
      }
    });

    expect(violations).toEqual([]);
  });

  it("model should not depend on ui", async () => {
    await expect(
      project
        .matchingPattern("src/.*/model/.*")
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/.*/ui/.*"),
    ).toPassAsync();
  });

  it("lib should not depend on ui", async () => {
    await expect(
      project
        .matchingPattern("src/.*/lib/.*")
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/.*/ui/.*"),
    ).toPassAsync();
  });

  it("api should not depend on ui", async () => {
    await expect(
      project
        .matchingPattern("src/.*/api/.*")
        .shouldNot()
        .dependOnFiles()
        .matchingPattern("src/.*/ui/.*"),
    ).toPassAsync();
  });
});
