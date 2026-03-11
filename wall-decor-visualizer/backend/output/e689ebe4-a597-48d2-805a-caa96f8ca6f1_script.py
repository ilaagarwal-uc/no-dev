OUTPUT_PATH = '/tmp/e689ebe4-a597-48d2-805a-caa96f8ca6f1.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on provided dimensions:
    - Total Wall Width: 14' 6" (7' + 7' 6")
    - Total Wall Height: 9'
    - Opening (Door/AC area): 7' wide by 8' high, located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    FT_TO_M = 0.3048

    # Dimensions in feet
    wall_width_ft = 14.5  # 7' + 7.5'
    wall_height_ft = 9.0
    wall_thickness_ft = 0.5  # Standard wall thickness assumption
    
    opening_width_ft = 7.0
    opening_height_ft = 8.0

    # Convert dimensions to meters
    wall_w = wall_width_ft * FT_TO_M
    wall_h = wall_height_ft * FT_TO_M
    wall_t = wall_thickness_ft * FT_TO_M
    
    op_w = opening_width_ft * FT_TO_M
    op_h = opening_height_ft * FT_TO_M

    # 1. Create the Main Wall
    # Center of the wall box (x, y, z)
    # We place the bottom-left-front corner at (0,0,0) for easier calculation
    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_w / 2, wall_t / 2, wall_h / 2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (wall_w, wall_t, wall_h)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 2. Create the Opening (Cutter)
    # The opening is 7' wide and 8' high, starting from the bottom-left corner
    bpy.ops.mesh.primitive_cube_add(size=1, location=(op_w / 2, wall_t / 2, op_h / 2))
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Scale cutter slightly larger on Y to ensure a clean boolean cut
    cutter.scale = (op_w, wall_t * 2, op_h)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 3. Apply Boolean Modifier to create the opening
    bool_mod = wall.modifiers.new(name="WallOpening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

    # 5. Export to GLB
    # Headless blender requires a full path or it saves to the current working directory
    export_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False
    )
    print(f"Exported wall skeleton to {export_path}")

# Execute the function
create_wall_skeleton()