OUTPUT_PATH = '/tmp/c66da8b6-4427-466e-bfe4-aac6d919d84e.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' for the opening section + 7'6" for the solid section)
    - Opening Height: 8'
    - Opening Width: 7'
    - Gap above opening: 1' (9' - 8')
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 unit = 1 foot
    wall_width = 14.5  # 7' + 7.5'
    wall_height = 9.0
    wall_thickness = 0.5 # Standard wall thickness assumption
    
    opening_width = 7.0
    opening_height = 8.0

    # 1. Create the Main Wall (Outer Boundary)
    # We create a cube and scale it to match the outer dimensions
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Scale and position so the bottom-left-front corner is at (0,0,0)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Door/Window area)
    # This represents the structural void in the wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Wall_Opening"
    
    # Scale the opening. We make it slightly thicker than the wall for a clean boolean cut.
    opening.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position it at the left side of the wall
    opening.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation to cut the opening from the wall
    bool_mod = wall.modifiers.new(name="Opening_Cut", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export the final structure to GLB
    # Headless blender will save this to the current working directory
    output_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False
    )
    
    print(f"Wall skeleton exported successfully to {output_path}")

# Execute the function directly
create_wall_skeleton()